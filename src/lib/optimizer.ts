/**
 * Exact protein optimiser.
 *
 * Bounded knapsack by dynamic programming, with an extra dimension for the
 * number of distinct foods (so plans stay short enough to actually follow).
 *
 *   dp[k][p] = minimum cost (₹) to get exactly p deci-grams of protein using
 *              exactly k distinct foods. Protein above `cap` saturates at cap.
 *
 * One table answers both questions the app asks:
 *   - goal mode:   cheapest plan with protein >= need
 *   - budget mode: most useful protein with cost <= budget
 * so the budget slider is a linear scan, never a recomputation.
 */

export interface OptItem {
  id: string;
  /** protein per step, in deci-grams (0.1 g) */
  protein: number;
  /** cost per step in rupees */
  cost: number;
  maxSteps: number;
  /** 1 when the user pinned this food */
  minSteps: number;
}

export interface Pick {
  id: string;
  steps: number;
}

export interface Solution {
  picks: Pick[];
  /** deci-grams, saturated at the table cap */
  protein: number;
  cost: number;
}

export interface Table {
  items: OptItem[];
  maxDistinct: number;
  cap: number;
  /** cost per (k, p); Infinity when unreachable */
  dp: Float64Array;
  /** per item layer: steps chosen to reach (k, p) */
  choice: Int8Array[];
  /** per item layer: protein level before this item */
  prevP: Int16Array[];
}

const EPS = 1e-9;

export function buildTable(items: OptItem[], cap: number, maxDistinct = 5): Table {
  const pinned = items.filter((i) => i.minSteps > 0).length;
  const K = Math.max(maxDistinct, pinned);
  const P = Math.max(0, Math.min(32000, Math.round(cap)));
  const W = P + 1;
  const size = (K + 1) * W;

  let dp = new Float64Array(size).fill(Infinity);
  dp[0] = 0;
  const choice: Int8Array[] = [];
  const prevP: Int16Array[] = [];

  for (const item of items) {
    const next = new Float64Array(size).fill(Infinity);
    const ch = new Int8Array(size);
    const pp = new Int16Array(size);
    const lo = Math.max(0, item.minSteps);
    const hi = Math.max(lo, item.maxSteps);

    for (let k = 0; k <= K; k++) {
      const base = k * W;
      for (let p = 0; p <= P; p++) {
        const c0 = dp[base + p];
        if (c0 === Infinity) continue;
        for (let s = lo; s <= hi; s++) {
          const k2 = s > 0 ? k + 1 : k;
          if (k2 > K) break;
          const p2 = Math.min(P, p + s * item.protein);
          const c2 = c0 + s * item.cost;
          const idx = k2 * W + p2;
          // strict improvement, or equal cost with fewer steps (simpler plan)
          if (c2 < next[idx] - EPS || (Math.abs(c2 - next[idx]) <= EPS && s < ch[idx])) {
            next[idx] = c2;
            ch[idx] = s;
            pp[idx] = p;
          }
        }
      }
    }
    dp = next;
    choice.push(ch);
    prevP.push(pp);
  }

  return { items, maxDistinct: K, cap: P, dp, choice, prevP };
}

function reconstruct(t: Table, k: number, p: number): Solution {
  const W = t.cap + 1;
  const cost = t.dp[k * W + p];
  const picks: Pick[] = [];
  let kk = k;
  let pp = p;
  for (let i = t.items.length - 1; i >= 0; i--) {
    const idx = kk * W + pp;
    const s = t.choice[i][idx];
    const prev = t.prevP[i][idx];
    if (s > 0) {
      picks.push({ id: t.items[i].id, steps: s });
      kk -= 1;
    }
    pp = prev;
  }
  picks.reverse();
  return { picks, protein: p, cost };
}

/** best state for each protein level: min cost over k, fewer foods on ties */
function bestPerLevel(t: Table): { cost: Float64Array; k: Int8Array } {
  const W = t.cap + 1;
  const cost = new Float64Array(W).fill(Infinity);
  const kk = new Int8Array(W);
  for (let k = 0; k <= t.maxDistinct; k++) {
    for (let p = 0; p < W; p++) {
      const c = t.dp[k * W + p];
      if (c < cost[p] - EPS) {
        cost[p] = c;
        kk[p] = k;
      }
    }
  }
  return { cost, k: kk };
}

const levelCache = new WeakMap<Table, { cost: Float64Array; k: Int8Array }>();
function levels(t: Table) {
  let l = levelCache.get(t);
  if (!l) {
    l = bestPerLevel(t);
    levelCache.set(t, l);
  }
  return l;
}

/** Cheapest plan with protein >= need. Null when no plan can reach it. */
export function solveForGoal(t: Table, need: number): Solution | null {
  const { cost, k } = levels(t);
  const start = Math.max(0, Math.min(t.cap, Math.ceil(need)));
  let best = -1;
  for (let p = start; p <= t.cap; p++) {
    if (cost[p] === Infinity) continue;
    if (best < 0 || cost[p] < cost[best] - EPS) best = p;
  }
  return best < 0 ? null : reconstruct(t, k[best], best);
}

/**
 * Most useful protein within a budget. Protein above `ceiling` is not
 * counted as useful, so extra budget past it buys nothing.
 */
export function solveForBudget(t: Table, budget: number, ceiling = t.cap): Solution | null {
  const { cost, k } = levels(t);
  let best = -1;
  let bestEff = -1;
  for (let p = 0; p <= t.cap; p++) {
    const c = cost[p];
    if (c === Infinity || c > budget + EPS) continue;
    const eff = Math.min(p, ceiling);
    if (eff > bestEff || (eff === bestEff && c < cost[best] - EPS)) {
      best = p;
      bestEff = eff;
    }
  }
  return best < 0 ? null : reconstruct(t, k[best], best);
}

/** Highest protein reachable at any price (used to explain infeasible goals). */
export function maxReachable(t: Table): Solution | null {
  return solveForBudget(t, Infinity);
}
