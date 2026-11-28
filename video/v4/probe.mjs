// Measure CSS-px boxes of key elements in the exact states the shots use (360x640 viewport).
import { chromium } from '@playwright/test';
const LIVE = 'https://protein-recharge.embarko.app/';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const box = async (label, loc) => { const r = await loc.first().boundingBox(); console.log(label, r && [r.x, r.y, r.x + r.width, r.y + r.height].map(Math.round).join(',')); };
await p.goto(LIVE, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle' });
await p.addStyleTag({ content: '#__embarko_orphan_banner{display:none!important}.banner--sample{display:none!important}' });
await box('landing h1', p.locator('h1'));
await box('landing build', p.getByRole('button', { name: 'Build my plan' }));
await p.getByRole('button', { name: 'Open a sample plan' }).click(); await p.waitForSelector('.plate__row');
await p.addStyleTag({ content: '.banner--sample{display:none!important}' });
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
for (const t of ['109 g', '30 g', '79 g']) await box('eq ' + t, p.getByText(t, { exact: true }));
// budget framing used in capture: .budget top - 64
await p.evaluate(() => { const e = document.querySelector('.budget'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 64); }); await p.waitForTimeout(300);
await box('budget block', p.locator('.budget'));
await box('meter card', p.locator('.platecard'));
await box('first row', p.locator('.plate__row'));
// exclude framing: .platecard top - 60, then open soya sheet
await p.evaluate(() => { const e = document.querySelector('.platecard'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 60); }); await p.waitForTimeout(300);
await box('soya row', p.locator('.plate__row', { hasText: 'Soya chunks' }));
await p.locator('.plate__row', { hasText: 'Soya chunks' }).click(); await p.waitForTimeout(600);
await box('dont suggest', p.getByRole('button', { name: 'Don’t suggest' }));
await p.getByRole('button', { name: 'Close' }).click(); await p.waitForTimeout(300);
await p.locator('.tabs--bottom').getByRole('button', { name: 'Foods' }).click(); await p.waitForSelector('.foodrow');
await p.evaluate(() => { const w = [...document.querySelectorAll('.foodrow')].find((r) => r.textContent.includes('Whey protein')); scrollTo(0, w.getBoundingClientRect().top + scrollY - 250); }); await p.waitForTimeout(300);
await box('whey row', p.locator('.foodrow', { hasText: 'Whey protein' }));
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200);
await box('foods h', p.locator('h1, h2').first());
await box('soya foodrow', p.locator('.foodrow', { hasText: 'Soya chunks' }));
await ctx.close();
const c2 = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const q = await c2.newPage(); await q.goto(LIVE, { waitUntil: 'networkidle' });
await q.evaluate(() => { const e = [...document.querySelectorAll('p,span,small')].find((x) => /Free, no sign-up/.test(x.textContent)); scrollTo(0, e.getBoundingClientRect().top + scrollY - 300); }); await q.waitForTimeout(300);
await box('free line', q.getByText(/Free, no sign-up/));
await b.close();
