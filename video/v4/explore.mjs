// v4 capture experiments: how the live app lays out at different phone viewports (screenshots only).
import { chromium } from '@playwright/test';
const LIVE = 'https://protein-recharge.embarko.app/';
const out = (n) => `video/v4/explore/${n}.png`;
const b = await chromium.launch();
for (const [w, h] of [[390, 693], [360, 640], [430, 764]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1080 / w, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(LIVE, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '#__embarko_orphan_banner{display:none!important}' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out(`${w}-landing`) });
  await p.getByRole('button', { name: 'Open a sample plan' }).click();
  await p.waitForSelector('.plate__row');
  await p.addStyleTag({ content: '.banner--sample{display:none!important}' });
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.screenshot({ path: out(`${w}-plan-top`) });
  await p.evaluate(() => { const e = document.querySelector('.budget'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 20); });
  await p.waitForTimeout(400);
  await p.screenshot({ path: out(`${w}-budget`) });
  await p.evaluate(() => { const e = document.querySelector('.platecard'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 20); });
  await p.waitForTimeout(400);
  await p.screenshot({ path: out(`${w}-plate`) });
  if (w === 390) {
    const full = await p.evaluate(() => document.body.scrollHeight);
    console.log('plan page height', full);
    await p.setViewportSize({ width: 390, height: Math.min(full, 4000) });
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.screenshot({ path: out('390-fullpage'), fullPage: true });
  }
  await ctx.close();
}
await b.close();
