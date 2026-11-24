import { FOODS, proteinPerTenRupees } from '../data/foods';
import { makePlanner } from './plan';
import { meterText } from './format';
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

  it('a plan reported as reaching the goal really contains at least the needed protein', () => {
    // regression: per-step protein was rounded to 0.1 g (6.25 -> 6.3), so "goal hit" plans could hold 78.9 of 79 g
    const profiles = [SAMPLE_PROFILE, { ...SAMPLE_PROFILE, weight: 55 }, { ...SAMPLE_PROFILE, weight: 81, kitchen: 'none' as const }];
    for (const prof of profiles) {
      const p = makePlanner(prof, {}, [], []);
      expect(p.goalPlan!.protein + 1e-9).toBeGreaterThanOrEqual(p.targets.need);
      // the budget the app labels "goal becomes reachable at" must really reach it, and so must every budget above it
      const anchor = Math.ceil(p.goalPlan!.cost - 1e-6);
      for (let r = anchor; r <= 200; r++) {
        expect(p.forBudget(r).protein + 1e-9).toBeGreaterThanOrEqual(p.targets.need);
      }
    }
  });

  it('meter never claims 79 of 79 g or "0 g short" for a plan that is still short', () => {
    // regression: the ₹50–52 sample plan holds 78.8 g and used to render "79 of 79 g · 0 g short"
    const p = makePlanner(SAMPLE_PROFILE, {}, [], []);
    const short = p.forBudget(52);
    expect(short.protein).toBeLessThan(p.targets.need);
    const m = meterText(short.protein, p.targets.need);
    expect(m.hit).toBe(false);
    expect(m.shown).toBe(78);
    expect(m.short).toBe('0.2 g short');
    expect(meterText(79.1, 79)).toEqual({ shown: 79, hit: true, short: '' });
    expect(meterText(61, 79).short).toBe('18 g short');
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
