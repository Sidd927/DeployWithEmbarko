import { effectivePack } from '../lib/plan';
import { bulk, money, rupees } from '../lib/format';
import { useStore } from '../state/store';
import { Icon } from '../components/Icon';

export function ListScreen({ notify }: { notify: (msg: string) => void }) {
  const { planner, budget, saved, setTab } = useStore();
  if (!planner) return null;
  const anchor = planner.goalPlan ?? planner.maxPlan;
  const plan = budget === null ? anchor : planner.forBudget(budget);

  if (!plan || !plan.items.length) {
    return (
      <div className="list">
        <h1 className="screen-title">Weekly shopping list</h1>
        <div className="empty">
          <p>Your plan is empty, so there&rsquo;s nothing to buy yet.</p>
          <button type="button" className="btn btn--primary" onClick={() => setTab('plan')}>
            Go to my plan
          </button>
        </div>
      </div>
    );
  }

  const rows = plan.items.map((it) => {
    const pack = effectivePack(it.food, saved.prices);
    const weekly = it.steps * it.food.step * 7;
    const packs = Math.ceil(weekly / pack.size - 1e-9);
    return { it, pack, weekly, packs, cost: packs * pack.price };
  });
  const total = rows.reduce((s, r) => s + r.cost, 0);

  const text = [
    'Protein Recharge: weekly shopping list',
    ...rows.map(
      (r) =>
        `- ${r.it.food.name}: ${bulk(r.it.food, r.weekly)} (${r.packs} x ${bulk(r.it.food, r.pack.size)}) ${rupees(r.cost)}`,
    ),
    `First shop: ${rupees(total)}. Average after that: ${rupees(plan.cost * 7)} a week.`,
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      notify('List copied');
    } catch {
      notify('Copy failed. Select the list and copy it by hand.');
    }
  };

  return (
    <div className="list">
      <h1 className="screen-title">Weekly shopping list</h1>
      <p className="section-lede">
        Seven days of your {Math.round(plan.protein)} g top-up, rounded up to whole packs.
      </p>
      <ul className="shop">
        {rows.map((r) => (
          <li key={r.it.food.id} className="shop__row">
            <span className="shop__icon">
              <Icon name={r.it.food.icon} />
            </span>
            <span className="shop__main">
              <span className="shop__name">{r.it.food.name}</span>
              <span className="shop__qty">
                {bulk(r.it.food, r.weekly)} needed. Buy {r.packs} &times; {bulk(r.it.food, r.pack.size)}
              </span>
            </span>
            <span className="shop__cost">{rupees(r.cost)}</span>
          </li>
        ))}
      </ul>
      <dl className="totals totals--list">
        <div>
          <dt>First shop, whole packs</dt>
          <dd>{rupees(total)}</dd>
        </div>
        <div>
          <dt>Average spend a week</dt>
          <dd>{rupees(plan.cost * 7)}</dd>
        </div>
      </dl>
      <p className="fineprint">
        Big packs last longer than a week, so the first shop costs more. After that you spend about {money(plan.cost)}{' '}
        a day on average.
      </p>
      <button type="button" className="btn btn--primary btn--block" onClick={copy}>
        <Icon name="copy" size={20} /> Copy list
      </button>
    </div>
  );
}
