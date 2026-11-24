import {
  FOODS,
  allowedByDiet,
  allowedByKitchen,
  stepKcal,
  stepProtein,
  unitPrice,
  type Food,
} from '../data/foods';
import { buildTable, maxReachable, solveForBudget, solveForGoal, type OptItem, type Solution, type Table } from './optimizer';
import { targets, type Profile, type Targets } from './profile';
import type { PackOverride } from './storage';

export interface PlanItem {
  food: Food;
  steps: number;
  protein: number;
  cost: number;
  kcal: number;
}

export interface Plan {
  items: PlanItem[];
  protein: number;
  cost: number;
  kcal: number;
}

export interface Pack {
  key: string;
  price: number;
  kind: 'partial' | 'best' | 'buffer' | 'max';
  plan: Plan;
}

export interface Planner {
  targets: Targets;
  foods: Food[];
  table: Table;
  goalPlan: Plan | null;
  maxPlan: Plan | null;
  packs: Pack[];
  forBudget: (rupees: number) => Plan;
}

export const TIERS = [19, 29, 49, 79, 119, 159];

export function effectivePack(food: Food, prices: Record<string, PackOverride>) {
  const o = prices[food.id];
  return o ? { ...food.pack, size: o.size, price: o.price } : food.pack;
}

export function availableFoods(profile: Profile, excluded: string[]): Food[] {
  return FOODS.filter(
    (f) => allowedByDiet(f, profile.diet) && allowedByKitchen(f, profile.kitchen) && !excluded.includes(f.id),
  );
}

function toPlan(sol: Solution | null, foods: Food[], prices: Record<string, PackOverride>): Plan | null {
  if (!sol) return null;
  const items = sol.picks.map((pk) => {
    const food = foods.find((f) => f.id === pk.id)!;
    const perStepCost = unitPrice(food, effectivePack(food, prices)) * food.step;
    return {
      food,
      steps: pk.steps,
      protein: stepProtein(food) * pk.steps,
      cost: perStepCost * pk.steps,
      kcal: stepKcal(food) * pk.steps,
    };
  });
  items.sort((a, b) => b.protein - a.protein);
  return {
    items,
    protein: items.reduce((s, i) => s + i.protein, 0),
    cost: items.reduce((s, i) => s + i.cost, 0),
    kcal: items.reduce((s, i) => s + i.kcal, 0),
  };
}

export function makePlanner(
  profile: Profile,
  prices: Record<string, PackOverride>,
  excluded: string[],
  pinned: string[],
): Planner {
  const t = targets(profile);
  const foods = availableFoods(profile, excluded);
  const items: OptItem[] = foods.map((f) => ({
    id: f.id,
    protein: Math.round(stepProtein(f) * 10),
    cost: unitPrice(f, effectivePack(f, prices)) * f.step,
    maxSteps: f.maxSteps,
    minSteps: pinned.includes(f.id) ? 1 : 0,
  }));
  const cap = Math.max(1, Math.round(t.ceiling * 10));
  const table = buildTable(items, cap, 5);
  const needP = Math.round(t.need * 10);
  const ceilP = Math.round(t.ceiling * 10);

  const goalPlan = toPlan(solveForGoal(table, needP), foods, prices);
  const maxPlan = toPlan(maxReachable(table), foods, prices);
  const forBudget = (r: number) =>
    toPlan(solveForBudget(table, r, ceilP), foods, prices) ?? { items: [], protein: 0, cost: 0, kcal: 0 };

  const packs: Pack[] = [];
  if (t.need > 0) {
    const anchor = goalPlan ?? maxPlan;
    if (anchor && anchor.items.length) {
      const anchorPrice = Math.max(1, Math.ceil(anchor.cost - 1e-6));
      const below = TIERS.filter((x) => x < anchorPrice)
        .map((x) => ({ x, plan: forBudget(x) }))
        .filter((p) => p.plan.items.length > 0)
        .slice(-2);
      for (const b of below) packs.push({ key: `t${b.x}`, price: b.x, kind: 'partial', plan: b.plan });
      packs.push({ key: 'anchor', price: anchorPrice, kind: goalPlan ? 'best' : 'max', plan: anchor });
      if (goalPlan) {
        const above = TIERS.find((x) => x > anchorPrice && forBudget(x).protein > goalPlan.protein + 3);
        if (above) packs.push({ key: `t${above}`, price: above, kind: 'buffer', plan: forBudget(above) });
      }
    }
  }

  return { targets: t, foods, table, goalPlan, maxPlan, packs, forBudget };
}

export function qualityNote(plan: Plan): { completeShare: number; text: string } {
  if (!plan.items.length) return { completeShare: 0, text: '' };
  const complete = plan.items.filter((i) => i.food.quality === 'complete').reduce((s, i) => s + i.protein, 0);
  const share = complete / plan.protein;
  const pct = Math.round(share * 100);
  const hasPulse = plan.items.some((i) => i.food.quality === 'pulse' || i.food.quality === 'nut');
  let text = `${pct}% of this top-up is complete protein (soy, dairy, eggs or meat).`;
  if (hasPulse) text += ' The dal, chana and peanuts pair with your roti and rice to round out the rest.';
  return { completeShare: share, text };
}

export function infeasibleReasons(profile: Profile, excluded: string[]): string[] {
  const r: string[] = [];
  if (profile.kitchen === 'none') r.push('A kettle unlocks soya chunks, oats and eggs.');
  if (profile.diet === 'vegan' || profile.diet === 'veg') r.push('Adding eggs or dairy widens the options.');
  if (excluded.length) r.push(`You turned off ${excluded.length} ${excluded.length === 1 ? 'food' : 'foods'}.`);
  return r;
}
