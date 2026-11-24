import { isValidProfile, type Profile } from './profile';

const KEY = 'protein-recharge:v1';

export interface PackOverride {
  size: number;
  price: number;
}

export interface Saved {
  profile: Profile | null;
  prices: Record<string, PackOverride>;
  excluded: string[];
  pinned: string[];
  sample?: boolean;
}

export const EMPTY: Saved = { profile: null, prices: {}, excluded: [], pinned: [] };

let available = true;

export function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw) as Partial<Saved>;
    const prices: Record<string, PackOverride> = {};
    for (const [id, v] of Object.entries(data.prices ?? {})) {
      if (v && v.size > 0 && v.price > 0 && Number.isFinite(v.size) && Number.isFinite(v.price)) prices[id] = v;
    }
    return {
      profile: isValidProfile(data.profile) ? data.profile : null,
      prices,
      excluded: Array.isArray(data.excluded) ? data.excluded.filter((x) => typeof x === 'string') : [],
      pinned: Array.isArray(data.pinned) ? data.pinned.filter((x) => typeof x === 'string') : [],
      sample: data.sample === true,
    };
  } catch {
    available = false;
    return EMPTY;
  }
}

export function save(s: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    available = true;
  } catch {
    available = false;
  }
}

export function storageAvailable(): boolean {
  return available;
}
