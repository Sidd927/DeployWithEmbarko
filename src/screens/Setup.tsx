import { useState } from 'react';
import type { Diet, Kitchen } from '../data/foods';
import {
  DEFAULT_PROFILE,
  DIETS,
  GOALS,
  KITCHENS,
  MESS,
  clampWeight,
  targets,
  type Goal,
  type MessQuality,
  type Profile,
} from '../lib/profile';
import { useStore } from '../state/store';
import { Brand, Choice } from '../components/parts';
import { Icon } from '../components/Icon';

const STEPS = ['weight', 'goal', 'diet', 'kitchen', 'mess'] as const;
const TITLES: Record<(typeof STEPS)[number], string> = {
  weight: 'What do you weigh?',
  goal: 'What are you eating protein for?',
  diet: 'What do you eat?',
  kitchen: 'What can you cook with?',
  mess: 'How many mess or home meals a day?',
};

export function Setup() {
  const { profile, isSample, setProfile, go } = useStore();
  const [p, setP] = useState<Profile>(profile && !isSample ? profile : DEFAULT_PROFILE);
  const [i, setI] = useState(0);
  const [weightText, setWeightText] = useState(String(p.weight));
  const [error, setError] = useState('');
  const step = STEPS[i];
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));

  const next = () => {
    if (step === 'weight') {
      const w = Number(weightText);
      if (!Number.isFinite(w) || w < 30 || w > 200) {
        setError('Enter a weight between 30 and 200 kg.');
        return;
      }
      set({ weight: clampWeight(w) });
    }
    setError('');
    if (i < STEPS.length - 1) setI(i + 1);
    else {
      setProfile(p);
      go('app');
    }
  };
  const back = () => (i === 0 ? go(profile ? 'app' : 'landing') : setI(i - 1));
  const t = targets(p);

  return (
    <div className="setup">
      <header className="topbar">
        <Brand onClick={() => go(profile ? 'app' : 'landing')} />
      </header>
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={i + 1} aria-label="Setup progress">
        {STEPS.map((s, k) => (
          <span key={s} className={k <= i ? 'is-on' : ''} />
        ))}
      </div>

      <form
        className="setup__body"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <p className="setup__count">
          Question {i + 1} of {STEPS.length}
        </p>
        <h1 className="setup__title">{TITLES[step]}</h1>

        {step === 'weight' && (
          <div className="weight">
            <button
              type="button"
              className="round-btn"
              aria-label="Decrease weight"
              onClick={() => setWeightText(String(clampWeight((Number(weightText) || 65) - 1)))}
            >
              <Icon name="minus" />
            </button>
            <label className="weight__field">
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={weightText}
                onChange={(e) => setWeightText(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                aria-label="Weight in kilograms"
                aria-invalid={!!error}
                aria-describedby={error ? 'weight-error' : undefined}
              />
              <span>kg</span>
            </label>
            <button
              type="button"
              className="round-btn"
              aria-label="Increase weight"
              onClick={() => setWeightText(String(clampWeight((Number(weightText) || 65) + 1)))}
            >
              <Icon name="plus" />
            </button>
          </div>
        )}
        {step === 'weight' && error ? (
          <p className="field-error" id="weight-error" role="alert">
            {error}
          </p>
        ) : null}
        {step === 'weight' && <p className="setup__hint">Protein targets are set per kilogram of body weight.</p>}

        {step === 'goal' && (
          <div className="choices">
            {(Object.keys(GOALS) as Goal[]).map((g) => (
              <Choice
                key={g}
                selected={p.goal === g}
                onClick={() => set({ goal: g })}
                title={`${GOALS[g].title}: ${Math.round(GOALS[g].gPerKg * p.weight)} g a day`}
                detail={`${GOALS[g].gPerKg} g per kg. ${GOALS[g].detail}.`}
              />
            ))}
          </div>
        )}

        {step === 'diet' && (
          <div className="choices">
            {(Object.keys(DIETS) as Diet[]).map((d) => (
              <Choice
                key={d}
                selected={p.diet === d}
                onClick={() => set({ diet: d })}
                title={DIETS[d].title}
                detail={DIETS[d].detail}
                icon={{ vegan: 'soya', veg: 'paneer', egg: 'egg', nonveg: 'chicken' }[d]}
              />
            ))}
          </div>
        )}

        {step === 'kitchen' && (
          <div className="choices">
            {(Object.keys(KITCHENS) as Kitchen[]).map((k) => (
              <Choice
                key={k}
                selected={p.kitchen === k}
                onClick={() => set({ kitchen: k })}
                title={KITCHENS[k].title}
                detail={KITCHENS[k].detail}
                icon={{ none: 'chana', kettle: 'sattu', stove: 'dal' }[k]}
              />
            ))}
          </div>
        )}

        {step === 'mess' && (
          <>
            <div className="segmented" role="radiogroup" aria-label="Meals a day">
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={p.messMeals === n}
                  className={p.messMeals === n ? 'is-on' : ''}
                  onClick={() => set({ messMeals: n })}
                >
                  {n}
                </button>
              ))}
            </div>
            {p.messMeals > 0 && (
              <>
                <h2 className="setup__sub">How much dal and paneer do they usually have?</h2>
                <div className="choices">
                  {(Object.keys(MESS) as MessQuality[]).map((q) => (
                    <Choice
                      key={q}
                      selected={p.messQuality === q}
                      onClick={() => set({ messQuality: q })}
                      title={`${MESS[q].title}: about ${MESS[q].g} g a meal`}
                      detail={MESS[q].detail}
                    />
                  ))}
                </div>
              </>
            )}
            <p className="setup__equation">
              {t.goal} g goal, about {t.base} g from meals, so you need a <strong>{t.need} g top-up</strong>.
            </p>
          </>
        )}

        <div className="setup__nav">
          <button type="button" className="btn btn--ghost" onClick={back}>
            <Icon name="back" size={20} /> Back
          </button>
          <button type="submit" className="btn btn--primary">
            {i === STEPS.length - 1 ? 'Show my packs' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}
