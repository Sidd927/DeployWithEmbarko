import type { Food } from '../data/foods';

export function rupees(n: number, decimals = 0): string {
  const v = decimals ? n.toFixed(decimals) : Math.round(n).toString();
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/** rupees with one decimal only when it matters: ₹52.1, ₹15 */
export function money(n: number): string {
  return Math.abs(n - Math.round(n)) < 0.05 ? rupees(n) : rupees(n, 1);
}

export function grams(n: number): string {
  return `${Math.round(n)} g`;
}

/** "2 eggs", "2 glasses (500 ml)", "50 g" */
export function quantity(food: Food, steps: number): { main: string; sub?: string } {
  const amount = steps * food.step;
  const unitText = food.unit === 'pc' ? '' : `${amount} ${food.unit}`;
  if (food.stepLabel) {
    const label = steps === 1 ? food.stepLabel.one : food.stepLabel.many;
    if (food.unit === 'pc') return { main: `${amount} ${label}` };
    if (food.id === 'pb') return { main: label, sub: unitText };
    return { main: `${steps} ${label}`, sub: unitText };
  }
  return { main: unitText, sub: food.note };
}

/** weekly shopping amount in friendly units */
export function bulk(food: Food, units: number): string {
  if (food.unit === 'pc') return `${units} ${units === 1 ? 'egg' : 'eggs'}`;
  units = Math.round(units * 100) / 100;
  if (units >= 1000) {
    const big = food.unit === 'ml' ? 'L' : 'kg';
    return `${(units / 1000).toFixed(units % 1000 === 0 ? 0 : 2).replace(/\.?0+$/, '')} ${big}`;
  }
  return `${units} ${food.unit}`;
}

/** Meter text: never show "79 of 79 g" or "0 g short" for a plan that is still short. */
export function meterText(value: number, need: number): { shown: number; hit: boolean; short: string } {
  const hit = value + 1e-6 >= need;
  const gap = need - value;
  const short = hit ? '' : `${gap < 1 ? (Math.ceil(gap * 10 - 1e-6) / 10).toFixed(1) : Math.ceil(gap - 1e-6)} g short`;
  return { shown: hit ? Math.round(value) : Math.floor(value), hit, short };
}
