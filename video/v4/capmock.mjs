// Caption treatment test over full-bleed app frames: soft band vs tight ink pill vs shadow-only.
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const f = (p) => pathToFileURL(resolve(p)).href;
const font = `@font-face{font-family:F;src:url(${f('video/v3/hf/assets/fonts/figtree.woff2')})}`;
const cap = 'At <b>₹53</b> a day, you actually hit your <b>goal.</b>';
const variants = {
  band: `<div style="position:absolute;left:0;right:0;top:1060px;height:300px;background:linear-gradient(rgba(20,36,30,0),rgba(20,36,30,.78) 32%,rgba(20,36,30,.78) 62%,rgba(20,36,30,0))"></div>
         <div class="c" style="top:1150px">${cap}</div>`,
  pill: `<div class="c" style="top:1150px"><span style="background:#14241E;padding:6px 18px 10px;border-radius:14px;box-decoration-break:clone;-webkit-box-decoration-break:clone;line-height:1.5">${cap}</span></div>`,
  shadow: `<div class="c" style="top:1150px;text-shadow:0 0 18px rgba(0,0,0,.9),0 2px 4px rgba(0,0,0,.9),0 0 3px #000">${cap}</div>`,
};
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
for (const [k, v] of Object.entries(variants)) {
  writeFileSync('video/v4/explore/_m.html', `<html><head><style>${font}*{margin:0}body{width:1080px;height:1920px;position:relative;background:url(${f('video/v4/explore/360-budget.png')}) 0 0/1080px 1920px}
  .c{position:absolute;left:90px;right:190px;text-align:center;font:800 50px/1.2 F;color:#fff}.c b{color:#FFC21A}</style></head><body>${v}</body></html>`);
  await p.goto(f('video/v4/explore/_m.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `video/v4/explore/cap-${k}.png` });
}
await b.close();
