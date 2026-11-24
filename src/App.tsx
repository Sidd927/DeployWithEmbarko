import { useCallback, useEffect, useRef, useState } from 'react';
import { encodeProfile } from './lib/profile';
import { StoreProvider, useStore, type Tab } from './state/store';
import { Brand } from './components/parts';
import { Icon } from './components/Icon';
import { Landing } from './screens/Landing';
import { Setup } from './screens/Setup';
import { PlanScreen } from './screens/PlanScreen';
import { FoodsScreen } from './screens/FoodsScreen';
import { ListScreen } from './screens/ListScreen';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'plan', label: 'Plan', icon: 'plate' },
  { id: 'foods', label: 'Foods', icon: 'tag' },
  { id: 'list', label: 'List', icon: 'basket' },
];

function Shell() {
  const s = useStore();
  const [toast, setToast] = useState('');
  const timer = useRef<number>();
  const notify = useCallback((m: string) => {
    setToast(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    document.title =
      s.view === 'app' && s.planner
        ? `${s.planner.targets.need} g top-up plan | Protein Recharge`
        : 'Protein Recharge: hit your protein on a hostel budget';
  }, [s.view, s.planner]);

  const share = async () => {
    if (!s.profile) return;
    const url = `${location.origin}${location.pathname}#p=${encodeProfile(s.profile)}`;
    const text = `My protein plan: ${s.planner?.targets.need ?? ''} g top-up a day, planned around mess food and a small budget.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Protein Recharge', text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      notify('Link copied');
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') notify('Could not share. Copy the address bar instead.');
    }
  };

  if (s.view === 'landing') return <Landing />;
  if (s.view === 'setup' || !s.profile) return <Setup />;

  return (
    <div className="app">
      <header className="topbar topbar--app">
        <Brand onClick={s.startOver} />
        <nav className="tabs tabs--top" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={s.tab === t.id ? 'is-on' : ''}
              aria-current={s.tab === t.id ? 'page' : undefined}
              onClick={() => s.setTab(t.id)}
            >
              <Icon name={t.icon} size={20} />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {s.sharedFrom ? (
        <div className="banner" role="status">
          <span>Someone shared this plan with you. Change the profile to make it yours.</span>
          <button type="button" className="icon-btn" onClick={s.dismissShared} aria-label="Dismiss">
            <Icon name="close" size={20} />
          </button>
        </div>
      ) : null}
      {s.isSample ? (
        <div className="banner banner--sample" role="status">
          <span>This is a sample profile.</span>
          <button type="button" className="link" onClick={() => s.go('setup')}>
            Build my own plan
          </button>
        </div>
      ) : null}
      {!s.persistent ? (
        <div className="banner" role="status">
          <span>This browser blocks saving, so your plan lasts only until you close the tab.</span>
        </div>
      ) : null}

      <main className="main">
        {s.tab === 'plan' && <PlanScreen onShare={share} />}
        {s.tab === 'foods' && <FoodsScreen />}
        {s.tab === 'list' && <ListScreen notify={notify} />}
      </main>

      <nav className="tabs tabs--bottom" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={s.tab === t.id ? 'is-on' : ''}
            aria-current={s.tab === t.id ? 'page' : undefined}
            onClick={() => s.setTab(t.id)}
          >
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className={`toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
