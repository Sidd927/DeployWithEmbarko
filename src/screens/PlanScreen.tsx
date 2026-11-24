import { useEffect, useRef, useState } from 'react';
import { infeasibleReasons, qualityNote, type Pack } from '../lib/plan';
import { money, rupees } from '../lib/format';
import { DIETS, GOALS, KITCHENS } from '../lib/profile';
import { useStore } from '../state/store';
import { Meter, PlateList, Voucher } from '../components/parts';
import { Icon } from '../components/Icon';
import { FoodSheet } from './FoodSheet';

const CAPTION: Record<Pack['kind'], string> = {
  partial: 'Budget pack',
  best: 'Cheapest to hit goal',
  buffer: 'Extra buffer',
  max: 'Most you can reach',
};

export function PlanScreen({ onShare }: { onShare: () => void }) {
  const { planner, profile, budget, setBudget, go, setTab, saved } = useStore();
  const [openFood, setOpenFood] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  // keep the selected pack in view inside the horizontal strip
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.querySelector<HTMLElement>('.is-selected');
    if (!strip || !el || strip.scrollWidth <= strip.clientWidth) return;
    const target = Math.max(0, el.parentElement!.offsetLeft - 20);
    const t = window.setTimeout(() => {
      strip.scrollTo({ left: target, behavior: firstScroll.current ? 'auto' : 'smooth' });
      firstScroll.current = false;
    }, 0);
    return () => window.clearTimeout(t);
  }, [budget, planner]);
  if (!planner || !profile) return null;
  const { targets: t, goalPlan, maxPlan, packs } = planner;
  const anchor = goalPlan ?? maxPlan;
  const anchorPrice = anchor ? Math.max(1, Math.ceil(anchor.cost - 1e-6)) : 49;
  const value = budget ?? anchorPrice;
  const plan = budget === null ? anchor ?? planner.forBudget(0) : planner.forBudget(budget);
  const sliderMax = Math.min(250, Math.max(120, Math.ceil((anchorPrice + 40) / 10) * 10));
  const covered = t.need === 0;
  const q = qualityNote(plan);
  const reasons = !goalPlan ? infeasibleReasons(profile, saved.excluded) : [];

  return (
    <div className="planscreen">
      <section className="summary">
        <button type="button" className="profile-chip" onClick={() => go('setup')}>
          <Icon name="user" size={18} />
          <span>
            {profile.weight} kg, {GOALS[profile.goal].title.toLowerCase()}, {DIETS[profile.diet].title.toLowerCase()},{' '}
            {KITCHENS[profile.kitchen].short}
          </span>
          <Icon name="edit" size={16} />
        </button>
        <p className="equation">
          <span className="equation__n">{t.goal} g</span> daily goal
          <span className="equation__op">minus</span>
          <span className="equation__n">{t.base} g</span> from meals
          <span className="equation__op">leaves</span>
          <span className="equation__n equation__n--key">{t.need} g</span> to top up
        </p>
      </section>

      {covered ? (
        <section className="empty">
          <h2>Your meals already cover your goal.</h2>
          <p>
            At about {t.base} g a day from meals, you don&rsquo;t need to buy anything extra. If you train hard, try the
            &ldquo;building muscle&rdquo; goal.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => go('setup')}>
            Change my goal
          </button>
        </section>
      ) : (
        <div className="plangrid">
          <div className="plangrid__controls">
            <section aria-labelledby="packs-title">
              <h2 className="section-title" id="packs-title">
                Daily packs
              </h2>
              <div className="packs" role="list" ref={stripRef}>
                {packs.map((p) => {
                  const selected = p.kind === 'best' || p.kind === 'max' ? budget === null || budget === p.price : budget === p.price;
                  return (
                    <div role="listitem" key={p.key}>
                      <Voucher
                        price={p.price}
                        protein={p.plan.protein}
                        need={t.need}
                        caption={CAPTION[p.kind]}
                        foods={p.plan.items}
                        selected={selected}
                        onSelect={() => setBudget(p.kind === 'best' || p.kind === 'max' ? null : p.price)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="budget" aria-labelledby="budget-title">
              <div className="budget__head">
                <h2 className="section-title" id="budget-title">
                  Daily budget
                </h2>
                <span className="budget__value">{rupees(value)}</span>
              </div>
              <div className="budget__slider">
                <input
                  type="range"
                  min={5}
                  max={sliderMax}
                  step={1}
                  value={Math.min(value, sliderMax)}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  aria-labelledby="budget-title"
                  aria-valuetext={`${rupees(value)} a day`}
                />
                {goalPlan ? (
                  <span
                    className="budget__mark"
                    style={{ left: `calc(${((anchorPrice - 5) / (sliderMax - 5)) * 100}% + ${(0.5 - (anchorPrice - 5) / (sliderMax - 5)) * 28}px)` }}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <p className="budget__note">
                {goalPlan ? (
                  <>
                    Your goal becomes reachable at <strong>{rupees(anchorPrice)} a day</strong>
                    {budget !== null && budget !== anchorPrice ? (
                      <>
                        .{' '}
                        <button type="button" className="link" onClick={() => setBudget(null)}>
                          Jump there
                        </button>
                      </>
                    ) : (
                      '.'
                    )}
                  </>
                ) : (
                  <>Your goal can&rsquo;t be reached with these foods. The most you can get is shown.</>
                )}
              </p>
              {reasons.length ? (
                <ul className="reasons">
                  {reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>

          <section className="plangrid__plate" aria-labelledby="plate-title">
            <div className="platecard">
              <h2 className="section-title" id="plate-title">
                Your daily top-up
              </h2>
              <Meter value={plan.protein} need={t.need} ceiling={t.ceiling} />
              {plan.items.length ? (
                <PlateList plan={plan} onOpen={setOpenFood} />
              ) : (
                <p className="empty-plate">Nothing fits in {rupees(value)}. Drag the budget up a little.</p>
              )}
              <dl className="totals">
                <div>
                  <dt>Per day</dt>
                  <dd>{money(plan.cost)}</dd>
                </div>
                <div>
                  <dt>Per month</dt>
                  <dd>{rupees(plan.cost * 30)}</dd>
                </div>
                <div>
                  <dt>Energy</dt>
                  <dd>
                    {Math.round(plan.kcal).toLocaleString('en-IN')}
                    <span className="totals__unit"> kcal</span>
                  </dd>
                </div>
              </dl>
              {q.text ? <p className="quality">{q.text}</p> : null}
              <div className="platecard__actions">
                <button type="button" className="btn btn--primary" onClick={() => setTab('list')} disabled={!plan.items.length}>
                  <Icon name="basket" size={20} /> Shopping list
                </button>
                <button type="button" className="btn btn--ghost" onClick={onShare}>
                  <Icon name="share" size={20} /> Share plan
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
      {openFood ? <FoodSheet id={openFood} onClose={() => setOpenFood(null)} /> : null}
    </div>
  );
}
