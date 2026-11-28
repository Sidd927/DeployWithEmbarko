// v3 covers in the v3 look (ink stage, haldi): Reels/Shorts cover (1080x1920) and YouTube thumbnail (1280x720).
// Same real numbers as the hook: 37.1 g vs 4.1 g protein per ₹10 at the app's typical shop prices (ratio 9.05).
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
const f = (p) => pathToFileURL(resolve(p)).href;
const INK = '#14241E', HALDI = '#FFC21A', MUTED = '#9FB0AA';
const css = `
@font-face{font-family:B;src:url(${f('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2')}) format('woff2');font-weight:200 800}
@font-face{font-family:F;src:url(${f('node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2')}) format('woff2');font-weight:300 900}
*{box-sizing:border-box;margin:0}body{background:${INK};color:#fff;font-family:F,sans-serif}
.k{font-family:B;font-weight:800;letter-spacing:-.05em;line-height:.92}
.lbl{color:${MUTED};font-weight:700}.nm{font-weight:700}
.bar{border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}.bar i{display:block;height:100%;border-radius:999px}
.x{position:absolute;border-radius:50%;background:${HALDI};color:${INK};display:flex;align-items:center;justify-content:center;
   font-family:B;font-weight:800;letter-spacing:-.05em;transform:rotate(-8deg)}
.brand{display:flex;align-items:center;gap:16px;font-family:B;font-weight:800;color:#fff}
`;
const mark = (s) => `<svg viewBox="0 0 32 32" width="${s}" height="${s}"><path d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z" fill="${HALDI}" stroke="${INK}" stroke-width="2"/><path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// Reels cover: key content between y 300 and 1500 so the 3:4 profile-grid crop (y 240-1680) keeps all of it
const cover = `<html><head><style>${css}
.w{position:relative;width:1080px;height:1920px;padding:330px 90px 0}
h1{font-size:132px;color:#fff}.lbl{font-size:44px;margin-top:22px}
.row{margin-top:58px}.nm{font-size:54px}.big{font-size:230px;margin-top:4px}
.bar{height:44px;margin-top:14px}.x{left:610px;top:1010px;width:290px;height:290px;font-size:140px}
.brand{position:absolute;left:90px;top:1420px;font-size:46px}</style></head><body><div class="w">
<h1 class="k">Soya vs whey</h1><p class="lbl">Protein you get for ₹10</p>
<div class="row"><p class="nm">Soya chunks</p><p class="k big" style="color:${HALDI}">37 g</p><div class="bar"><i style="width:100%;background:${HALDI}"></i></div></div>
<div class="row"><p class="nm">Whey protein</p><p class="k big">4 g</p><div class="bar"><i style="width:11%;background:#fff"></i></div></div>
<div class="x">9×</div>
<div class="brand">${mark(66)}Protein Recharge</div></div></body></html>`;
const yt = `<html><head><style>${css}
.w{position:relative;width:1280px;height:720px;padding:64px 70px;display:grid;grid-template-columns:1fr 470px;gap:56px;align-items:center}
h1{font-size:150px}.lbl{font-size:36px;margin-top:24px;line-height:1.25}.brand{font-size:32px;margin-top:34px}
.row+.row{margin-top:26px}.nm{font-size:34px}.big{font-size:120px}.bar{height:26px;margin-top:8px}
.x{left:1010px;top:390px;width:190px;height:190px;font-size:92px}</style></head><body><div class="w"><div>
<h1 class="k">9× more<br><span style="color:${HALDI}">protein</span></h1><p class="lbl">per ₹10: soya chunks vs whey,<br>at typical Indian shop prices</p>
<div class="brand">${mark(48)}Protein Recharge</div></div>
<div><div class="row"><p class="nm">Soya chunks</p><p class="k big" style="color:${HALDI}">37 g</p><div class="bar"><i style="width:100%;background:${HALDI}"></i></div></div>
<div class="row"><p class="nm">Whey protein</p><p class="k big">4 g</p><div class="bar"><i style="width:11%;background:#fff"></i></div></div></div>
</div></body></html>`;
const dir = resolve(tmpdir(), 'pr-v3-covers'); mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'c.html'), cover); writeFileSync(resolve(dir, 'y.html'), yt);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(pathToFileURL(resolve(dir, 'c.html')).href, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'video/exports/cover-v3-reels-1080x1920.png' });
await p.setViewportSize({ width: 1280, height: 720 });
await p.goto(pathToFileURL(resolve(dir, 'y.html')).href, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'video/exports/thumbnail-v3-youtube-1280x720.png' });
await b.close(); console.log('ok');
