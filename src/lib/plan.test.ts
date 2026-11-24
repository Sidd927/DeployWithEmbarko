import { FOODS, proteinPerTenRupees } from '../data/foods';
import { makePlanner } from './plan';
import { DEFAULT_PROFILE, SAMPLE_PROFILE, decodeProfile, encodeProfile, targets } from './profile';

describe('catalogue', () => {
  it('has sane values for every food', () => {
    for (const f of FOODS) {
      expect(f.protein).toBeGreaterThan(0);
      expect(f.kcal).toBeGreaterThan(0);
      expect(f.step).toBeGreaterThan(0);
      expect(f.maxSteps).toBeGreaterThan(0);
      expect(f.pack.size).toBeGreaterThan(0);
      expect(f.pack.price).toBeGreaterThan(0);
      // protein can't exceed weight (per 100 g)
      if (f.unit !== 'pc') expect(f.protein).toBeLessThanOrEqual(100);
    }
  });

  it('ranks soya chunks as the cheapest protein, as every source agrees', () => {
    const ranked = [...FOODS].sort((a, b) => proteinPerTenRupees(b) - proteinPerTenRupees(a));
    expect(ranked[0].id).toBe('soya');
  });
});

describe('planner', () => {
  it('builds a goal-hitting sample plan for a kettle eggetarian', () => {
    const p = makePlanner(SAMPLE_PROFILE, {}, [], []);
    expect(p.targets.goal).toBe(109);
    expect(p.targets.need).toBe(79);
    expect(p.goalPlan).not.toBeNull();
    expect(p.goalPlan!.protein).toBeGreaterThanOrEqual(79);
    expect(p.goalPlan!.items.length).toBeLessThanOrEqual(5);
    expect(p.packs.some((x) => x.kind === 'best')).toBe(true);
    // no stove-only foods for a kettle
    expect(p.goalPlan!.items.every((i) => i.food.kitchen !== 'stove')).toBe(true);
  });

  it('never suggests foods outside the diet', () => {
    const p = makePlanner({ ...DEFAULT_PROFILE, diet: 'vegan', kitchen: 'stove' }, {}, [], []);
    const all = [p.goalPlan, ...p.packs.map((x) => x.plan)].flatMap((pl) => pl?.items ?? []);
    expect(all.every((i) => i.food.group === 'plant')).toBe(true);
  });

  it('honours exclusions and pins', () => {
    const p = makePlanner(SAMPLE_PROFILE, {}, ['soya'], ['milk']);
    expect(p.goalPlan!.items.some((i) => i.food.id === 'soya')).toBe(false);
    expect(p.goalPlan!.items.some((i) => i.food.id === 'milk')).toBe(true);
  });

  it('budget plans are monotonic in protein and stay within budget', () => {
    const p = makePlanner(SAMPLE_PROFILE, {}, [], []);
    let last = -1;
    for (let r = 0; r <= 200; r += 5) {
      const plan = p.forBudget(r);
      expect(plan.cost).toBeLessThanOrEqual(r + 1e-6);
      expect(plan.protein + 1e-6).toBeGreaterThanOrEqual(last);
      last = plan.protein;
    }
  });

  it('reacts to price edits', () => {
    const cheapMilk = makePlanner(SAMPLE_PROFILE, { milk: { size: 1000, price: 10 } }, [], []);
    expect(cheapMilk.goalPlan!.items.some((i) => i.food.id === 'milk')).toBe(true);
  });

  it('handles the mess already covering the goal', () => {
    const p = makePlanner({ ...DEFAULT_PROFILE, weight: 40, goal: 'healthy', messMeals: 3, messQuality: 'good' }, {}, [], []);
    expect(p.targets.need).toBe(0);
    expect(p.packs).toEqual([]);
  });

  it('round-trips share links', () => {
    expect(decodeProfile(encodeProfile(SAMPLE_PROFILE))).toEqual(SAMPLE_PROFILE);
    expect(decodeProfile('garbage!!')).toBeNull();
  });

  it('computes ICMR-based targets', () => {
    expect(targets({ ...DEFAULT_PROFILE, weight: 60, goal: 'healthy', messMeals: 0 }).goal).toBe(50);
  });
});
