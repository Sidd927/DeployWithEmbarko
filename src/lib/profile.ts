import type { Diet, Kitchen } from '../data/foods';

export type Goal = 'healthy' | 'active' | 'muscle';
export type MessQuality = 'light' | 'typical' | 'good';

export interface Profile {
  weight: number;
  goal: Goal;
  diet: Diet;
  kitchen: Kitchen;
  messMeals: number;
  messQuality: MessQuality;
}

/** grams of protein per kg body weight per day */
export const GOALS: Record<Goal, { gPerKg: number; title: string; detail: string }> = {
  healthy: {
    gPerKg: 0.83,
    title: 'Stay healthy',
    detail: 'ICMR-NIN 2024 recommended intake for healthy adults',
  },
  active: {
    gPerKg: 1.2,
    title: 'Active or playing sport',
    detail: 'For regular training, running or sport',
  },
  muscle: {
    gPerKg: 1.6,
    title: 'Building muscle',
    detail: 'Above this, ICMR-NIN notes no extra muscle gain from protein',
  },
};

/** rough protein per mess meal (dal, roti, rice, sabzi) in grams */
export const MESS: Record<MessQuality, { g: number; title: string; detail: string }> = {
  light: { g: 10, title: 'Light', detail: 'Thin dal, mostly rice' },
  typical: { g: 15, title: 'Typical', detail: 'Dal, 3 rotis, rice, sabzi' },
  good: { g: 20, title: 'Good', detail: 'Thick dal, rajma or paneer often' },
};

export const DIETS: Record<Diet, { title: string; detail: string }> = {
  vegan: { title: 'Vegan', detail: 'No dairy, eggs or meat' },
  veg: { title: 'Vegetarian', detail: 'Dairy is fine, no eggs' },
  egg: { title: 'Veg + eggs', detail: 'Eggetarian' },
  nonveg: { title: 'Non-veg', detail: 'Eggs and chicken too' },
};

export const KITCHENS: Record<Kitchen, { title: string; short: string; detail: string }> = {
  none: { title: 'Nothing', short: 'no kitchen', detail: 'Only ready-to-eat foods' },
  kettle: { title: 'Electric kettle', short: 'kettle', detail: 'Hot water: soak, steep, boil eggs' },
  stove: { title: 'Full kitchen', short: 'full kitchen', detail: 'Stove or induction, pressure cooker' },
};

export const DEFAULT_PROFILE: Profile = {
  weight: 65,
  goal: 'active',
  diet: 'egg',
  kitchen: 'kettle',
  messMeals: 2,
  messQuality: 'typical',
};

export const SAMPLE_PROFILE: Profile = {
  weight: 68,
  goal: 'muscle',
  diet: 'egg',
  kitchen: 'kettle',
  messMeals: 2,
  messQuality: 'typical',
};

export interface Targets {
  /** total daily protein goal, g */
  goal: number;
  /** estimated protein already eaten from mess meals, g */
  base: number;
  /** top-up needed, g (>= 0) */
  need: number;
  /** most top-up protein that is still useful, g */
  ceiling: number;
}

export function targets(p: Profile): Targets {
  const goal = Math.round(p.weight * GOALS[p.goal].gPerKg);
  const base = p.messMeals * MESS[p.messQuality].g;
  const need = Math.max(0, goal - base);
  const usefulTotal = Math.max(goal, Math.min(p.weight * 1.6, goal * 1.3));
  const ceiling = Math.max(need, Math.round(usefulTotal - base));
  return { goal, base, need, ceiling };
}

export function clampWeight(w: number): number {
  return Math.min(200, Math.max(30, Math.round(w)));
}

export function isValidProfile(x: unknown): x is Profile {
  if (!x || typeof x !== 'object') return false;
  const p = x as Profile;
  return (
    typeof p.weight === 'number' &&
    p.weight >= 30 &&
    p.weight <= 200 &&
    p.goal in GOALS &&
    p.diet in DIETS &&
    p.kitchen in KITCHENS &&
    Number.isInteger(p.messMeals) &&
    p.messMeals >= 0 &&
    p.messMeals <= 3 &&
    p.messQuality in MESS
  );
}

/* ---------- share links ---------- */

const KEYS = ['weight', 'goal', 'diet', 'kitchen', 'messMeals', 'messQuality'] as const;

export function encodeProfile(p: Profile): string {
  const compact = KEYS.map((k) => p[k]).join('.');
  return btoa(compact).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeProfile(s: string): Profile | null {
  try {
    const raw = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    const parts = raw.split('.');
    if (parts.length !== KEYS.length) return null;
    const p = {
      weight: Number(parts[0]),
      goal: parts[1],
      diet: parts[2],
      kitchen: parts[3],
      messMeals: Number(parts[4]),
      messQuality: parts[5],
    };
    return isValidProfile(p) ? p : null;
  } catch {
    return null;
  }
}
