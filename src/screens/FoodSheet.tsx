import { useState } from 'react';
import { FOOD_BY_ID, allowedByDiet, allowedByKitchen, stepKcal, stepProtein } from '../data/foods';
import { effectivePack } from '../lib/plan';
import { bulk, rupees } from '../lib/format';
import { useStore } from '../state/store';
import { Sheet } from '../components/parts';
import { Icon } from '../components/Icon';

const SOURCE: Record<string, string> = {
  IFCT: 'Indian Food Composition Tables 2017 (ICMR-NIN)',
  USDA: 'USDA FoodData Central',
  Label: 'Typical Indian pack label',
};

export function FoodSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { saved, profile, setPrice, toggleExcluded, togglePinned } = useStore();
  const food = FOOD_BY_ID[id];
  const pack = effectivePack(food, saved.prices);
  const [size, setSize] = useState(String(pack.size));
  const [price, setPriceText] = useState(String(pack.price));
  const [err, setErr] = useState('');
  const custom = !!saved.prices[id];
  const pinned = saved.pinned.includes(id);
  const excluded = saved.excluded.includes(id);
  const blockedBy =
    profile && !allowedByDiet(food, profile.diet)
      ? 'Not part of your diet'
      : profile && !allowedByKitchen(food, profile.kitchen)
        ? food.kitchen === 'stove'
          ? 'Needs a stove or induction'
          : 'Needs an electric kettle'
        : '';

  const savePrice = () => {
    const s = Number(size);
    const pr = Number(price);
    if (!(s > 0) || !(pr > 0) || s > 100000 || pr > 100000) {
      setErr('Enter a pack size and price above zero.');
      return;
    }
    setErr('');
    setPrice(id, { size: s, price: pr });
    onClose();
  };

  return (
    <Sheet title={food.name} onClose={onClose}>
      <div className="fsheet">
        <div className="fsheet__hero">
          <span className="fsheet__icon">
            <Icon name={food.icon} size={32} />
          </span>
          <p className="fsheet__prep">{food.prep}</p>
        </div>
        <dl className="fsheet__facts">
          <div>
            <dt>Per serving</dt>
            <dd>
              {food.unit === 'pc' ? `1 ${food.stepLabel?.one ?? 'piece'}` : `${food.step} ${food.unit}`}
            </dd>
          </div>
          <div>
            <dt>Protein</dt>
            <dd>{stepProtein(food).toFixed(1)} g</dd>
          </div>
          <div>
            <dt>Energy</dt>
            <dd>{Math.round(stepKcal(food))} kcal</dd>
          </div>
          <div>
            <dt>Most per day</dt>
            <dd>
              {food.maxSteps} {food.maxSteps === 1 ? 'serving' : 'servings'}
            </dd>
          </div>
        </dl>
        <p className="fsheet__source">Nutrition source: {SOURCE[food.source]}.</p>

        {blockedBy ? (
          <p className="notice">{blockedBy}, so it isn't in your plans.</p>
        ) : (
          <div className="fsheet__toggles">
            <button
              type="button"
              className={`toggle${pinned ? ' is-on' : ''}`}
              aria-pressed={pinned}
              onClick={() => togglePinned(id)}
            >
              <Icon name="pin" size={20} /> Always include
            </button>
            <button
              type="button"
              className={`toggle toggle--warn${excluded ? ' is-on' : ''}`}
              aria-pressed={excluded}
              onClick={() => toggleExcluded(id)}
            >
              <Icon name="ban" size={20} /> Don&rsquo;t suggest
            </button>
          </div>
        )}

        <form
          className="price-form"
          onSubmit={(e) => {
            e.preventDefault();
            savePrice();
          }}
        >
          <h3>Your price</h3>
          <p className="price-form__hint">
            {custom ? 'You set this price.' : `Typical price: ${rupees(food.pack.price)} for a ${food.pack.label}.`} Change it
            to match your shop.
          </p>
          <div className="price-form__row">
            <label>
              <span>Pack size ({food.unit === 'pc' ? 'eggs' : food.unit})</span>
              <input inputMode="decimal" value={size} onChange={(e) => setSize(e.target.value)} />
            </label>
            <label>
              <span>Price (₹)</span>
              <input inputMode="decimal" value={price} onChange={(e) => setPriceText(e.target.value)} />
            </label>
          </div>
          {err ? (
            <p className="field-error" role="alert">
              {err}
            </p>
          ) : (
            <p className="price-form__calc">
              {Number(size) > 0 && Number(price) > 0
                ? `${rupees(Number(price), Number(price) % 1 ? 1 : 0)} for ${bulk(food, Number(size))}`
                : ' '}
            </p>
          )}
          <div className="price-form__actions">
            {custom ? (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setPrice(id, null);
                  onClose();
                }}
              >
                Use typical price
              </button>
            ) : null}
            <button type="submit" className="btn btn--primary">
              Save price
            </button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}
