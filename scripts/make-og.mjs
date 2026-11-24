// Renders public/og.png (1200x630) and public/apple-touch-icon.png (180x180) with the brand fonts.
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const font = (p) => pathToFileURL(resolve(p)).href;
const bric = font('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2');
const fig = font('node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2');

const css = `
@font-face{font-family:B;src:url(${bric}) format('woff2');font-weight:200 800}
@font-face{font-family:F;src:url(${fig}) format('woff2');font-weight:300 900}
*{box-sizing:border-box;margin:0}
body{background:#E6EAEA;color:#14241E;font-family:F,sans-serif}
`;
const mark = `<svg viewBox="0 0 32 32" width="56" height="56"><path d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z" fill="#FFC21A" stroke="#14241E" stroke-width="2"/><path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="#14241E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const og = `<html><head><style>${css}
.w{width:1200px;height:630px;padding:64px 72px;display:grid;grid-template-columns:1.15fr 1fr;gap:56px;align-items:center}
.brand{display:flex;gap:14px;align-items:center;font-family:B;font-weight:800;font-size:30px;margin-bottom:34px}
h1{font-family:B;font-weight:800;font-size:84px;line-height:.98;letter-spacing:-.035em}
p{margin-top:24px;font-size:26px;color:#4D5D57;line-height:1.35}
.v{background:#FFC21A;border:3px solid #14241E;border-radius:26px;overflow:hidden;
 -webkit-mask:radial-gradient(circle at left 213px,transparent 16px,#000 17px),radial-gradient(circle at right 213px,transparent 16px,#000 17px);-webkit-mask-composite:source-in}
.top{height:210px;padding:26px 30px 0;display:flex;flex-direction:column}
.cap{font-weight:800;font-size:22px}
.price{font-family:B;font-weight:800;font-size:118px;letter-spacing:-.05em;line-height:.95;margin-top:6px}
.price small{font-family:F;font-size:26px;letter-spacing:0;margin-left:6px}
.price sup{font-size:.55em;vertical-align:.45em;letter-spacing:0}
.prot{margin-top:auto;padding-bottom:18px;font-size:24px}.prot b{font-family:B;font-size:28px}
.perf{border-top:3px dashed rgba(20,36,30,.55);margin:0 30px}
.bot{background:#14241E;color:#FFC21A;padding:18px 30px;font-weight:800;font-size:22px;display:flex;justify-content:space-between}
</style></head><body><div class="w"><div>
<div class="brand">${mark}Protein Recharge</div>
<h1>Hit your protein on a hostel budget.</h1>
<p>The exact cheapest foods to close your protein gap, around your mess, your kettle and your money.</p>
</div><div class="v"><div class="top"><span class="cap">Cheapest to hit goal</span>
<span class="price"><sup>₹</sup>53<small>/day</small></span><span class="prot"><b>79 g</b> protein top-up</span></div>
<div class="perf"></div><div class="bot"><span>No stove needed</span><span>Goal covered</span></div></div></div></body></html>`;

const icon = `<html><head><style>${css}body{background:#FFC21A;width:180px;height:180px;display:grid;place-items:center}</style></head><body>${mark.replace('width="56" height="56"', 'width="132" height="132"')}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const dir = resolve(tmpdir(), 'pr-og');
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'og.html'), og);
writeFileSync(resolve(dir, 'icon.html'), icon);
await page.goto(pathToFileURL(resolve(dir, 'og.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await page.setViewportSize({ width: 180, height: 180 });
await page.goto(pathToFileURL(resolve(dir, 'icon.html')).href);
await page.screenshot({ path: 'public/apple-touch-icon.png' });
await browser.close();
console.log('ok');
