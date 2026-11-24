import { useState } from 'react';
import { FOODS, allowedByDiet, allowedByKitchen, proteinPerTenRupees } from '../data/foods';
import { effectivePack } from '../lib/plan';
import { bulk, rupees } from '../lib/format';
import { useStore } from '../state/store';
import { Icon } from '../components/Icon';
import { FoodSheet } from './FoodSheet';

export function FoodsScreen() {
  const { saved, profile, resetPrices } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  if (!profile) return null;

  const rows = FOODS.map((f) => {
    const pack = effectivePack(f, saved.prices);
    const reason = !allowedByDiet(f, profile.diet)
      ? 'Not in your diet'
      : !allowedByKitchen(f, profile.kitchen)
        ? f.kitchen === 'stove'
          ? 'Needs a stove'
          : 'Needs a kettle'
        : '';
    return { f, pack, v: proteinPerTenRupees(f, pack), reason };
  }).sort((a, b) => Number(!!a.reason) - Number(!!b.reason) || b.v - a.v);
  const top = Math.max(...rows.map((r) => r.v));
  const customCount = Object.keys(saved.prices).length;

  return (
    <div className="foods">
      <div className="foods__head">
        <h1 className="screen-title">Foods and prices</h1>
        <p className="section-lede">
          Ranked by protein you get for ₹10 at your prices. Tap a food to change its price, always include it, or stop
          it being suggested.
        </p>
      </div>
      <ul className="foodlist">
        {rows.map(({ f, pack, v, reason }) => {
          const pinned = saved.pinned.includes(f.id);
          const excluded = saved.excluded.includes(f.id);
          const custom = !!saved.prices[f.id];
          return (
            <li key={f.id} className={reason || excluded ? 'is-muted' : ''}>
              <button type="button" className="foodrow" onClick={() => setOpen(f.id)}>
                <span className="foodrow__icon">
                  <Icon name={f.icon} />
                </span>
                <span className="foodrow__main">
                  <span className="foodrow__name">
                    {f.name}
                    {pinned ? (
                      <span className="badge badge--pin">
                        <Icon name="pin" size={14} /> Always
                      </span>
                    ) : null}
                    {excluded ? (
                      <span className="badge badge--off">
                        <Icon name="ban" size={14} /> Off
                      </span>
                    ) : null}
                  </span>
                  <span className="foodrow__price">
                    {rupees(pack.price)} for {bulk(f, pack.size)}
                    {custom ? <span className="foodrow__custom"> (your price)</span> : null}
                    {reason ? <span className="foodrow__reason"> {reason}</span> : null}
                  </span>
                  <span className="foodrow__bar" aria-hidden="true">
                    <span style={{ width: `${(v / top) * 100}%` }} />
                  </span>
                </span>
                <span className="foodrow__val">
                  <strong>{v.toFixed(1)} g</strong>
                  <span>per ₹10</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {customCount ? (
        <button type="button" className="btn btn--ghost foods__reset" onClick={resetPrices}>
          Reset {customCount} {customCount === 1 ? 'price' : 'prices'} to typical
        </button>
      ) : null}
      <p className="fineprint">
        Typical prices are estimates for common pack sizes in Indian shops. Your edits are saved on this device.
      </p>
      {open ? <FoodSheet id={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
