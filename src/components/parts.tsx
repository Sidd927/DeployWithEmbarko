import { useEffect, useId, useRef, type ReactNode } from 'react';
import type { Plan } from '../lib/plan';
import { money, quantity } from '../lib/format';
import { Icon } from './Icon';

/* ---------- Voucher: the signature element ---------- */

export function Voucher({
  price,
  protein,
  need,
  caption,
  foods,
  selected,
  onSelect,
  size = 'md',
}: {
  price: number;
  protein: number;
  need: number;
  caption: string;
  foods: Plan['items'];
  selected?: boolean;
  onSelect?: () => void;
  size?: 'md' | 'lg';
}) {
  const pct = need > 0 ? Math.min(100, Math.round((protein / need) * 100)) : 100;
  const hit = protein + 0.05 >= need;
  const Tag = onSelect ? 'button' : 'div';
  return (
    <Tag
      className={`voucher voucher--${size}${selected ? ' is-selected' : ''}${hit ? ' is-hit' : ''}`}
      onClick={onSelect}
      {...(onSelect ? { type: 'button', 'aria-pressed': !!selected } : {})}
    >
      <span className="voucher__top">
        <span className="voucher__caption">{caption}</span>
        <span className="voucher__price">
          <span className="voucher__rupee">₹</span>
          {price}
          <span className="voucher__per">/day</span>
        </span>
        <span className="voucher__protein">
          <strong>{Math.round(protein)} g</strong> protein top-up
        </span>
      </span>
      <span className="voucher__perf" aria-hidden="true" />
      <span className="voucher__bottom">
        <span className="voucher__foods" role="img" aria-label={foods.map((f) => f.food.name).join(', ') || 'No foods yet'}>
          {foods.slice(0, 5).map((f) => (
            <Icon key={f.food.id} name={f.food.icon} size={20} />
          ))}
        </span>
        <span className="voucher__pct">{hit ? 'Goal covered' : `${pct}% of goal`}</span>
      </span>
    </Tag>
  );
}

/* ---------- Protein meter ---------- */

export function Meter({ value, need, ceiling }: { value: number; need: number; ceiling: number }) {
  const max = Math.max(ceiling, need, value, 1) * 1.08;
  const hit = value + 0.05 >= need;
  return (
    <div className={`meter${hit ? ' is-hit' : ''}`}>
      <div className="meter__head">
        <span className="meter__value">
          {Math.round(value)}
          <span className="meter__of"> of {Math.round(need)} g</span>
        </span>
        <span className="meter__status" role="status">
          {hit ? (
            <>
              <Icon name="check" size={18} /> Goal hit
            </>
          ) : (
            `${Math.round(need - value)} g short`
          )}
        </span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-label="Protein top-up"
        aria-valuemin={0}
        aria-valuemax={Math.round(need)}
        aria-valuenow={Math.round(value)}
      >
        <div className="meter__fill" style={{ width: `${(value / max) * 100}%` }} />
        <div className="meter__goal" style={{ left: `${(need / max) * 100}%` }} />
      </div>
    </div>
  );
}

/* ---------- Plate rows ---------- */

export function PlateList({ plan, onOpen }: { plan: Plan; onOpen?: (id: string) => void }) {
  return (
    <ul className="plate">
      {plan.items.map((it) => {
        const q = quantity(it.food, it.steps);
        const inner = (
          <>
            <span className="plate__icon">
              <Icon name={it.food.icon} />
            </span>
            <span className="plate__what">
              <span className="plate__name">{it.food.name}</span>
              <span className="plate__qty">
                {q.main}
                {q.sub ? <span className="plate__sub"> ({q.sub})</span> : null}
              </span>
            </span>
            <span className="plate__nums">
              <span className="plate__protein">{it.protein.toFixed(it.protein < 10 ? 1 : 0)} g</span>
              <span className="plate__cost">{money(it.cost)}</span>
            </span>
          </>
        );
        return (
          <li key={it.food.id}>
            {onOpen ? (
              <button type="button" className="plate__row" onClick={() => onOpen(it.food.id)}>
                {inner}
                <Icon name="next" size={18} className="plate__chev" />
              </button>
            ) : (
              <div className="plate__row">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Bottom sheet ---------- */

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Choice cards (setup) ---------- */

export function Choice({
  selected,
  onClick,
  title,
  detail,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  detail?: string;
  icon?: string;
}) {
  return (
    <button type="button" className={`choice${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={onClick}>
      {icon ? <Icon name={icon} className="choice__icon" /> : null}
      <span className="choice__text">
        <span className="choice__title">{title}</span>
        {detail ? <span className="choice__detail">{detail}</span> : null}
      </span>
      <span className="choice__dot" aria-hidden="true">
        {selected ? <Icon name="check" size={16} /> : null}
      </span>
    </button>
  );
}

export function Brand({ onClick }: { onClick?: () => void }) {
  const content = (
    <>
      <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z"
          fill="var(--haldi)"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="brand__name">Protein Recharge</span>
    </>
  );
  return onClick ? (
    <button type="button" className="brand" onClick={onClick} aria-label="Protein Recharge home">
      {content}
    </button>
  ) : (
    <span className="brand">{content}</span>
  );
}
