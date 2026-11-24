// Renders the YouTube thumbnail (1280x720) and the Reels/Shorts cover (1080x1920).
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
.v{background:#FFC21A;border:5px solid #14241E;border-radius:36px;overflow:hidden;position:relative}
.cap{font-weight:800}.price{font-family:B;font-weight:800;letter-spacing:-.05em;line-height:.9}
.price sup{font-size:.5em;vertical-align:.55em;letter-spacing:0;margin-right:4px}.price small{font-family:F;font-size:.22em;letter-spacing:0;margin-left:8px;font-weight:800}
.perf{border-top:5px dashed rgba(20,36,30,.55)}
.band{background:#14241E;color:#FFC21A;font-weight:800}
h1{font-family:B;font-weight:800;letter-spacing:-.04em;line-height:.95}
`;
const mark = (s) => `<svg viewBox="0 0 32 32" width="${s}" height="${s}"><path d="M4 6h24a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6V8a2 2 0 0 1 2-2Z" fill="#FFC21A" stroke="#14241E" stroke-width="2"/><path d="M11 11h9M11 14.5h9M11 11c4 0 4 7 0 7h-1l7 5" fill="none" stroke="#14241E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const yt = `<html><head><style>${css}
.w{width:1280px;height:720px;padding:56px 64px;display:grid;grid-template-columns:1fr 520px;gap:48px;align-items:center}
h1{font-size:104px}.by{margin-top:14px;font-size:26px;font-weight:700;color:#4D5D57}.q{font-family:B;font-weight:800;font-size:44px;margin-top:22px;letter-spacing:-.02em}
.b{display:flex;gap:14px;align-items:center;font-family:B;font-weight:800;font-size:32px;margin-bottom:26px}
.v{padding:30px 34px 0}.cap{font-size:28px}.price{font-size:170px;margin-top:6px}.pr{font-size:32px;margin:12px 0 26px}.pr b{font-family:B;font-size:40px}
.band{margin:0 -34px;padding:22px 34px;font-size:30px}
</style></head><body><div class="w"><div>
<div class="b">${mark(52)}Protein Recharge</div>
<h1>Hostel mess food. Enough protein?</h1>
<p class="q">I built the cheapest fix.</p><p class="by">by Siddhant Patil · live on Embarko</p></div>
<div class="v"><div class="cap">Cheapest to hit goal</div><div class="price"><sup>₹</sup>53<small>/day</small></div>
<div class="pr"><b>79 g</b> protein top-up</div><div class="perf"></div><div class="band">Goal covered. No stove needed.</div></div></div></body></html>`;

const cover = `<html><head><style>${css}
.w{width:1080px;height:1920px;padding:300px 100px 0}
.b{display:flex;gap:18px;align-items:center;font-family:B;font-weight:800;font-size:48px;margin-bottom:56px}
h1{font-size:132px}
.v{margin-top:70px;padding:44px 48px 0}.cap{font-size:40px}.price{font-size:250px;margin-top:10px}.pr{font-size:46px;margin:18px 0 36px}.pr b{font-family:B;font-size:58px}
.band{margin:0 -48px;padding:34px 48px;font-size:46px}
.by{margin-top:14px;font-size:38px;font-weight:700;color:#4D5D57}.tag{margin-top:46px;font-family:B;font-weight:800;font-size:52px;letter-spacing:-.02em}
</style></head><body><div class="w">
<div class="b">${mark(76)}Protein Recharge</div>
<h1>Hostel mess food. Enough protein?</h1>
<div class="v"><div class="cap">Cheapest to hit goal</div><div class="price"><sup>₹</sup>53<small>/day</small></div>
<div class="pr"><b>79 g</b> protein top-up</div><div class="perf"></div><div class="band">Goal covered</div></div>
<p class="tag">#DeployWithEmbarko</p><p class="by">by Siddhant Patil · live on Embarko</p></div></body></html>`;

const dir = resolve(tmpdir(), 'pr-thumbs');
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'yt.html'), yt);
writeFileSync(resolve(dir, 'cover.html'), cover);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto(pathToFileURL(resolve(dir, 'yt.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'video/exports/thumbnail-youtube-1280x720.png' });
await p.setViewportSize({ width: 1080, height: 1920 });
await p.goto(pathToFileURL(resolve(dir, 'cover.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'video/exports/cover-reels-1080x1920.png' });
await b.close();
console.log('ok');
