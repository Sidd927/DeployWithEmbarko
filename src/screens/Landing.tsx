import { useMemo, useState } from 'react';
import { FOODS, proteinPerTenRupees } from '../data/foods';
import { makePlanner } from '../lib/plan';
import { SAMPLE_PROFILE } from '../lib/profile';
import { useStore } from '../state/store';
import { Brand, Voucher } from '../components/parts';
import { Icon } from '../components/Icon';
import { rupees } from '../lib/format';

export function Landing() {
  const { go, setProfile } = useStore();
  const demo = useMemo(() => makePlanner(SAMPLE_PROFILE, {}, [], []), []);
  const best = Math.ceil(demo.goalPlan?.cost ?? 49);
  const [budget, setBudget] = useState(29);
  const plan = demo.forBudget(budget);
  const ranking = useMemo(
    () =>
      [...FOODS]
        .filter((f) => f.id !== 'egg-stall')
        .map((f) => ({ f, v: proteinPerTenRupees(f) }))
        .sort((a, b) => b.v - a.v)
        .slice(0, 8),
    [],
  );
  const top = ranking[0].v;

  return (
    <div className="landing">
      <header className="topbar">
        <Brand />
      </header>

      <section className="hero">
        <div className="hero__copy">
          <h1 className="hero__title">Hit your protein on a hostel budget.</h1>
          <p className="hero__lede">
            Tell us what your mess serves, whether you have a kettle and what you can spend. We work out the cheapest
            foods that close the gap, down to the last egg.
          </p>
          <div className="hero__ctas">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => go('setup')}>
              Build my plan
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => {
                setProfile(SAMPLE_PROFILE, { sample: true });
                go('app');
              }}
            >
              Open a sample plan
            </button>
          </div>
          <p className="hero__fine">Free, no sign-up. Everything stays on your phone.</p>
        </div>

        <div className="hero__demo" aria-label="Live example">
          <p className="demo__who">
            Example: 68 kg, building muscle, veg + eggs, electric kettle, two mess meals a day. Needs a{' '}
            {demo.targets.need} g top-up.
          </p>
          <Voucher
            size="lg"
            price={budget}
            protein={plan.protein}
            need={demo.targets.need}
            caption={budget >= best ? 'Covers the goal' : 'Daily pack'}
            foods={plan.items}
          />
          <label className="demo__slider">
            <span className="demo__label">Drag the daily budget</span>
            <input
              type="range"
              min={10}
              max={90}
              step={1}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-valuetext={`${rupees(budget)} a day`}
            />
          </label>
          <ul className="demo__foods">
            {plan.items.map((i) => (
              <li key={i.food.id}>
                <Icon name={i.food.icon} size={18} />
                {i.food.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="explain">
        <h2 className="section-title">How it works</h2>
        <ol className="steps">
          <li>
            <h3>Tell us about your day</h3>
            <p>Your weight, your goal, what you can cook with, and how many mess meals you eat.</p>
          </li>
          <li>
            <h3>Pick a pack</h3>
            <p>
              Plans come as daily recharge packs. Each one is the exact cheapest mix of foods for that price, not a
              guess.
            </p>
          </li>
          <li>
            <h3>Shop once a week</h3>
            <p>Get a shopping list in real pack sizes, with the weekly cost. Change any price to match your shop.</p>
          </li>
        </ol>
      </section>

      <section className="ranking">
        <h2 className="section-title">Protein you get for ₹10</h2>
        <p className="section-lede">
          Using typical shop prices. Soya chunks win by a distance, which is why they show up in almost every plan.
        </p>
        <ul className="bars">
          {ranking.map(({ f, v }) => (
            <li key={f.id}>
              <span className="bars__name">
                <Icon name={f.icon} size={18} />
                {f.name}
              </span>
              <span className="bars__track">
                <span className="bars__fill" style={{ width: `${(v / top) * 100}%` }} />
              </span>
              <span className="bars__val">{v.toFixed(1)} g</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="foot">
        <p>
          Targets follow the ICMR-NIN Dietary Guidelines for Indians (2024). Nutrition values are typical figures from
          IFCT 2017, USDA FoodData Central and pack labels. Prices are estimates you can edit. This is general
          information, not medical advice. If you have kidney disease or a medical condition, ask your doctor first.
        </p>
        <p className="foot__made">Built with Claude Code. Hosted on Embarko.</p>
      </footer>
    </div>
  );
}
