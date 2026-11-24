import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { makePlanner, type Planner } from '../lib/plan';
import { decodeProfile, type Profile } from '../lib/profile';
import { load, save, storageAvailable, type PackOverride, type Saved } from '../lib/storage';

export type View = 'landing' | 'setup' | 'app';
export type Tab = 'plan' | 'foods' | 'list';

interface Store {
  saved: Saved;
  profile: Profile | null;
  planner: Planner | null;
  view: View;
  tab: Tab;
  /** budget chosen on the slider; null follows the cheapest goal plan */
  budget: number | null;
  sharedFrom: boolean;
  isSample: boolean;
  persistent: boolean;
  go: (v: View) => void;
  setTab: (t: Tab) => void;
  setBudget: (b: number | null) => void;
  setProfile: (p: Profile, opts?: { sample?: boolean }) => void;
  setPrice: (id: string, o: PackOverride | null) => void;
  resetPrices: () => void;
  toggleExcluded: (id: string) => void;
  togglePinned: (id: string) => void;
  dismissShared: () => void;
  startOver: () => void;
}

const Ctx = createContext<Store | null>(null);

function readShared(): Profile | null {
  const m = window.location.hash.match(/[#&]p=([A-Za-z0-9_-]+)/);
  return m ? decodeProfile(m[1]) : null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    const s = load();
    const shared = readShared();
    return { saved: shared ? { ...s, profile: shared, sample: false } : s, shared: !!shared };
  });
  const [saved, setSaved] = useState<Saved>(initial.saved);
  const [view, setView] = useState<View>(initial.saved.profile ? 'app' : 'landing');
  const [tab, setTabState] = useState<Tab>('plan');
  const [budget, setBudget] = useState<number | null>(null);
  const [sharedFrom, setSharedFrom] = useState(initial.shared);
  const [persistent, setPersistent] = useState(true);

  useEffect(() => {
    if (initial.shared) history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [initial.shared]);

  useEffect(() => {
    save(saved);
    setPersistent(storageAvailable());
  }, [saved]);

  const planner = useMemo(
    () => (saved.profile ? makePlanner(saved.profile, saved.prices, saved.excluded, saved.pinned) : null),
    [saved],
  );

  const go = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    window.scrollTo({ top: 0 });
  }, []);

  const value: Store = {
    saved,
    profile: saved.profile,
    planner,
    view,
    tab,
    budget,
    sharedFrom,
    isSample: !!saved.sample,
    persistent,
    go,
    setTab,
    setBudget,
    setProfile: (p, opts) => {
      setSaved((s) => ({ ...s, profile: p, sample: !!opts?.sample }));
      setBudget(null);
    },
    setPrice: (id, o) =>
      setSaved((s) => {
        const prices = { ...s.prices };
        if (o) prices[id] = o;
        else delete prices[id];
        return { ...s, prices };
      }),
    resetPrices: () => setSaved((s) => ({ ...s, prices: {} })),
    toggleExcluded: (id) =>
      setSaved((s) => ({
        ...s,
        excluded: s.excluded.includes(id) ? s.excluded.filter((x) => x !== id) : [...s.excluded, id],
        pinned: s.pinned.filter((x) => x !== id),
      })),
    togglePinned: (id) =>
      setSaved((s) => ({
        ...s,
        pinned: s.pinned.includes(id) ? s.pinned.filter((x) => x !== id) : [...s.pinned, id],
        excluded: s.excluded.filter((x) => x !== id),
      })),
    dismissShared: () => setSharedFrom(false),
    startOver: () => {
      setSaved((s) => ({ ...s, profile: null, sample: false }));
      setBudget(null);
      setTabState('plan');
      setView('landing');
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}
