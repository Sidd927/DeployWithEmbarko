import { buildTable, solveForBudget, solveForGoal, type OptItem } from './optimizer';

/** exhaustive search for small instances */
function brute(items: OptItem[], cap: number, K: number) {
  const results: { protein: number; cost: number; distinct: number }[] = [];
  const rec = (i: number, p: number, c: number, d: number) => {
    if (i === items.length) {
      if (d <= K) results.push({ protein: Math.min(cap, p), cost: c, distinct: d });
      return;
    }
    const it = items[i];
    for (let s = it.minSteps; s <= it.maxSteps; s++) {
      rec(i + 1, p + s * it.protein, c + s * it.cost, d + (s > 0 ? 1 : 0));
    }
  };
  rec(0, 0, 0, 0);
  return results;
}

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function randomItems(r: () => number, n: number): OptItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `f${i}`,
    protein: 10 + Math.floor(r() * 200),
    cost: Math.round((1 + r() * 30) * 100) / 100,
    maxSteps: 1 + Math.floor(r() * 3),
    minSteps: r() < 0.1 ? 1 : 0,
  }));
}

describe('optimizer', () => {
  it('matches brute force for goal mode on 300 random instances', () => {
    const r = rng(42);
    for (let t = 0; t < 300; t++) {
      const items = randomItems(r, 2 + Math.floor(r() * 5));
      const K = 1 + Math.floor(r() * 4);
      const cap = 1500;
      const need = Math.floor(r() * 900);
      const table = buildTable(items, cap, K);
      const got = solveForGoal(table, need);
      const pinned = items.filter((i) => i.minSteps > 0).length;
      const opts = brute(items, cap, Math.max(K, pinned)).filter((x) => x.protein >= need);
      if (opts.length === 0) {
        expect(got).toBeNull();
      } else {
        const best = Math.min(...opts.map((o) => o.cost));
        expect(got).not.toBeNull();
        expect(got!.cost).toBeCloseTo(best, 6);
        // the reconstructed picks really cost and give what was reported
        const byId = Object.fromEntries(items.map((i) => [i.id, i]));
        const cost = got!.picks.reduce((s, p) => s + p.steps * byId[p.id].cost, 0);
        const prot = got!.picks.reduce((s, p) => s + p.steps * byId[p.id].protein, 0);
        expect(cost).toBeCloseTo(got!.cost, 6);
        expect(prot).toBeGreaterThanOrEqual(need);
        expect(got!.picks.length).toBeLessThanOrEqual(Math.max(K, pinned));
      }
    }
  });

  it('matches brute force for budget mode with a ceiling', () => {
    const r = rng(7);
    for (let t = 0; t < 300; t++) {
      const items = randomItems(r, 2 + Math.floor(r() * 5));
      const K = 1 + Math.floor(r() * 4);
      const cap = 1500;
      const budget = r() * 60;
      const ceiling = 200 + Math.floor(r() * 800);
      const table = buildTable(items, cap, K);
      const got = solveForBudget(table, budget, ceiling);
      const pinned = items.filter((i) => i.minSteps > 0).length;
      const opts = brute(items, cap, Math.max(K, pinned)).filter((x) => x.cost <= budget + 1e-9);
      if (opts.length === 0) {
        expect(got).toBeNull();
      } else {
        const bestEff = Math.max(...opts.map((o) => Math.min(o.protein, ceiling)));
        expect(Math.min(got!.protein, ceiling)).toBe(bestEff);
        expect(got!.cost).toBeLessThanOrEqual(budget + 1e-9);
      }
    }
  });

  it('respects pinned foods', () => {
    const items: OptItem[] = [
      { id: 'cheap', protein: 100, cost: 1, maxSteps: 3, minSteps: 0 },
      { id: 'pricey', protein: 100, cost: 10, maxSteps: 1, minSteps: 1 },
    ];
    const sol = solveForGoal(buildTable(items, 1000, 5), 200)!;
    expect(sol.picks.find((p) => p.id === 'pricey')?.steps).toBe(1);
    expect(sol.cost).toBe(11);
  });

  it('beats a greedy cheapest-per-gram strategy when caps bind', () => {
    // greedy fills from best ₹/g first and overshoots; DP finds the exact cheaper mix
    const items: OptItem[] = [
      { id: 'a', protein: 260, cost: 3.5, maxSteps: 2, minSteps: 0 }, // best ₹/g
      { id: 'b', protein: 60, cost: 2.0, maxSteps: 4, minSteps: 0 },
      { id: 'c', protein: 250, cost: 9.0, maxSteps: 2, minSteps: 0 },
    ];
    const need = 640;
    const sol = solveForGoal(buildTable(items, 2000, 5), need)!;
    // greedy: a×2 (520) → b×2 (640) = 7 + 4 = ₹11; DP must be <= greedy
    expect(sol.cost).toBeLessThanOrEqual(11);
    expect(sol.protein).toBeGreaterThanOrEqual(need);
  });

  it('returns an empty plan when nothing is needed', () => {
    const sol = solveForGoal(buildTable([{ id: 'x', protein: 10, cost: 1, maxSteps: 1, minSteps: 0 }], 100), 0)!;
    expect(sol.picks).toEqual([]);
    expect(sol.cost).toBe(0);
  });
});
