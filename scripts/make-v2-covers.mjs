// v2 covers: Reels/Shorts cover (1080x1920) and YouTube thumbnail (1280x720), built on the verified hook.
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
const f = (p) => pathToFileURL(resolve(p)).href;
const css = `
@font-face{font-family:B;src:url(${f('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2')}) format('woff2');font-weight:200 800}
@font-face{font-family:F;src:url(${f('node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2')}) format('woff2');font-weight:300 900}
*{box-sizing:border-box;margin:0}body{background:#E6EAEA;color:#14241E;font-family:F,sans-serif}
.k{font-family:B;font-weight:800;letter-spacing:-.045em;line-height:.9}
.row{display:flex;align-items:center;justify-content:space-between;background:#fff;border:5px solid #14241E;border-radius:28px;padding:22px 30px}
.row.win{background:#FFC21A}
.name{font-weight:800}.num{font-family:B;font-weight:800;letter-spacing:-.03em}
.per{font-weight:700;color:#4D5D57}
.brand{display:flex;align-items:center;gap:14px;font-family:B;font-weight:800}
`;
const mark = (s) => `<svg viewBox="0 0 32 32" width="${s}" height="${s}"><path d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z" fill="#FFC21A" stroke="#14241E" stroke-width="2"/><path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="#14241E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const cover = `<html><head><style>${css}
.w{width:1080px;height:1920px;padding:300px 110px 0 110px;display:flex;flex-direction:column;gap:34px}
h1{font-size:150px}.sub{font-size:52px;font-weight:700;color:#4D5D57;margin-top:-6px}
.row .name{font-size:52px}.row .num{font-size:92px}.row .per{font-size:30px}
.brand{font-size:46px;margin-top:20px}</style></head><body><div class="w">
<h1 class="k">Soya vs whey</h1><p class="sub">Protein you get for ₹10</p>
<div class="row win"><span class="name">Soya chunks</span><span><span class="num">37 g</span></span></div>
<div class="row"><span class="name">Whey protein</span><span><span class="num">4 g</span></span></div>
<p class="sub" style="font-size:36px">Typical Indian shop prices · from the app</p>
<div class="brand">${mark(64)}Protein Recharge</div></div></body></html>`;
const yt = `<html><head><style>${css}
.w{width:1280px;height:720px;padding:56px 64px;display:grid;grid-template-columns:1fr 520px;gap:44px;align-items:center}
h1{font-size:120px}.sub{font-size:36px;font-weight:700;color:#4D5D57;margin-top:14px}
.rows{display:grid;gap:18px}.row{padding:16px 24px}.row .name{font-size:36px}.row .num{font-size:72px}
.brand{font-size:30px;margin-top:22px}</style></head><body><div class="w"><div>
<h1 class="k">9× more protein</h1><p class="sub">per ₹10: soya chunks vs whey, at typical shop prices</p>
<div class="brand">${mark(44)}Protein Recharge</div></div>
<div class="rows"><div class="row win"><span class="name">Soya chunks</span><span class="num">37 g</span></div>
<div class="row"><span class="name">Whey</span><span class="num">4 g</span></div><p class="sub" style="font-size:26px;text-align:center">protein per ₹10</p></div></div></body></html>`;
const dir = resolve(tmpdir(), 'pr-v2-covers'); mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'c.html'), cover); writeFileSync(resolve(dir, 'y.html'), yt);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(pathToFileURL(resolve(dir, 'c.html')).href, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'video/exports/cover-v2-reels-1080x1920.png' });
await p.setViewportSize({ width: 1280, height: 720 });
await p.goto(pathToFileURL(resolve(dir, 'y.html')).href, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'video/exports/thumbnail-v2-youtube-1280x720.png' });
await b.close(); console.log('ok');
