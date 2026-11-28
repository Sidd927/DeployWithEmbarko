// V4 footage: purpose-built shots of the LIVE app, recorded in an exact 9:16 phone viewport.
// 360 x 640 CSS px at 4.5x density -> 1620 x 2880 frames, so 1.0-1.5x push-ins stay sharp on a 1080 x 1920 canvas.
// Usage: node video/v4/capture_v4.mjs [clip ...]      Output: video/v4/footage/<clip>.mp4 (30 fps)
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LIVE = 'https://protein-recharge.embarko.app/';
const OUT = resolve('video/v4/footage');
const TMP = resolve('video/work/frames-v4');
const FF = '/opt/homebrew/bin/ffmpeg';
const VW = 360, VH = 640, DPR = 4.5;
const PW = VW * DPR, PH = VH * DPR;
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* A visible fingertip so viewers can follow taps and drags (same as earlier versions, scaled for 360 px). */
const TOUCH_JS = `
(() => {
  if (window.__touchViz) return; window.__touchViz = true;
  const s = document.createElement('style');
  s.textContent = '.__t{position:fixed;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:rgba(20,36,30,.26);border:3px solid rgba(20,36,30,.78);pointer-events:none;z-index:2147483647;transition:transform .25s,opacity .35s}.__t.up{transform:scale(1.6);opacity:0}';
  document.documentElement.appendChild(s);
  let dot = null;
  const place = (e) => { if (!dot) return; dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; };
  addEventListener('pointerdown', (e) => { dot = document.createElement('div'); dot.className='__t'; document.documentElement.appendChild(dot); place(e); }, true);
  addEventListener('pointermove', (e) => place(e), true);
  addEventListener('pointerup', () => { const d = dot; dot = null; if (d) { d.classList.add('up'); setTimeout(() => d.remove(), 400); } }, true);
})();`;
// Only Embarko's temporary "unclaimed app" banner (absent on the claimed app) and the sample-plan notice are hidden.
const HIDE = '#__embarko_orphan_banner{display:none!important}.banner--sample{display:none!important}';

async function phone(browser, origin = 'https://protein-recharge.embarko.app') {
  const ctx = await browser.newContext({
    viewport: { width: VW, height: VH }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36',
  });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  await ctx.addInitScript(TOUCH_JS);
  return { ctx, page: await ctx.newPage() };
}

async function openApp(page, { sample = false } = {}) {
  await page.goto(LIVE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(() => document.fonts.ready);
  if (sample) {
    await page.getByRole('button', { name: 'Open a sample plan' }).click();
    await page.waitForSelector('.plate__row');
    await page.addStyleTag({ content: HIDE });
  }
}

const scrollToEl = (page, sel, offset) =>
  page.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o); }, [sel, offset]);

async function record(page, name, fn) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp });
    try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch {}
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 93, maxWidth: PW, maxHeight: PH });
  const t0 = Date.now() / 1000;
  await fn();
  await sleep(300);
  await cdp.send('Page.stopScreencast');
  const tEnd = Date.now() / 1000;
  const dir = resolve(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  let list = '';
  frames.forEach((f, i) => {
    const file = resolve(dir, `${String(i).padStart(5, '0')}.jpg`);
    writeFileSync(file, Buffer.from(f.data, 'base64'));
    const next = i + 1 < frames.length ? frames[i + 1].t : Math.max(f.t + 0.5, tEnd - t0 + frames[0].t);
    list += `file '${file}'\nduration ${Math.max(0.001, next - f.t).toFixed(4)}\n`;
  });
  list += `file '${resolve(dir, `${String(frames.length - 1).padStart(5, '0')}.jpg`)}'\n`;
  writeFileSync(resolve(dir, 'list.txt'), list);
  const out = resolve(OUT, `${name}.mp4`);
  execFileSync(FF, ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', resolve(dir, 'list.txt'),
    '-vf', `fps=30,scale=${PW}:${PH}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '15',
    '-movflags', '+faststart', out]);
  const dur = execFileSync('/opt/homebrew/bin/ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
  console.log(`${name}: ${frames.length} frames, ${Number(dur).toFixed(2)} s`);
}

async function tap(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await sleep(100);
  const box = await locator.boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

async function dragRange(page, selector, from, to, ms) {
  const el = page.locator(selector);
  const box = await el.boundingBox();
  const { min, max } = await el.evaluate((n) => ({ min: Number(n.min), max: Number(n.max) }));
  const thumb = 28;
  const x = (v) => box.x + thumb / 2 + ((v - min) / (max - min)) * (box.width - thumb);
  const y = box.y + box.height / 2;
  await page.mouse.move(x(from), y);
  await page.mouse.down();
  await sleep(250);
  const steps = Math.max(10, Math.round(ms / 33));
  for (let i = 1; i <= steps; i++) {
    const e = i / steps;
    const eased = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
    await page.mouse.move(x(from + (to - from) * eased), y);
    await sleep(ms / steps);
  }
  await sleep(250);
  await page.mouse.up();
}

const marks = {};   // media times of key events per clip (seconds from record start), written to marks.json
const stamp = (clip, key, t0) => { (marks[clip] ||= {})[key] = +((Date.now() - t0) / 1000).toFixed(3); };

const clips = {
  /* 1-2: the Foods ranking, then a real smooth scroll down to whey (row 11). */
  async foods(b) {
    const { ctx, page } = await phone(b);
    await openApp(page, { sample: true });
    await page.locator('.tabs--bottom').getByRole('button', { name: 'Foods' }).click();
    await page.waitForSelector('.foodrow');
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(700);
    const t0 = Date.now();
    await record(page, 'foods', async () => {
      await sleep(2200);
      stamp('foods', 'scroll', t0);
      await page.evaluate(() => {
        const w = [...document.querySelectorAll('.foodrow')].find((r) => r.textContent.includes('Whey protein'));
        window.scrollTo({ top: w.getBoundingClientRect().top + scrollY - 250, behavior: 'smooth' });
      });
      await sleep(4200);
    });
    await ctx.close();
  },
  /* 4: the plan's own equation, held. */
  async plan(b) {
    const { ctx, page } = await phone(b);
    await openApp(page, { sample: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(700);
    await record(page, 'plan', async () => { await sleep(6500); });
    await ctx.close();
  },
  /* 5-6: landing hero -> Build my plan -> the five questions, tapped through. */
  async setup(b) {
    const { ctx, page } = await phone(b);
    await openApp(page);
    await sleep(500);
    const t0 = Date.now();
    await record(page, 'setup', async () => {
      await sleep(2600);
      stamp('setup', 'tap_build', t0);
      await tap(page, page.getByRole('button', { name: 'Build my plan' }));
      await sleep(900);
      stamp('setup', 'q_weight', t0);
      const w = page.getByLabel('Weight in kilograms');
      await tap(page, w);
      await w.fill('');
      await page.keyboard.type('68', { delay: 260 });
      await sleep(500);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(800);
      stamp('setup', 'q_goal', t0);
      await tap(page, page.getByRole('button', { name: /Building muscle/ }));
      await sleep(500);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(800);
      stamp('setup', 'q_diet', t0);
      await sleep(250);
      await tap(page, page.getByRole('button', { name: /Veg \+ eggs/ }));
      await sleep(600);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(800);
      stamp('setup', 'q_kitchen', t0);
      await sleep(250);
      await tap(page, page.getByRole('button', { name: /Electric kettle/ }));
      await sleep(600);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(800);
      stamp('setup', 'q_mess', t0);
      await sleep(250);
      await tap(page, page.getByRole('radio', { name: '2', exact: true }));
      await sleep(700);
      await tap(page, page.getByRole('button', { name: 'Show my packs' }));
      stamp('setup', 'plan', t0);
      await sleep(1800);
    });
    await ctx.close();
  },
  /* 7: the payoff. Budget block framed under the sticky header: ₹20 (short) -> drag -> ₹53 (goal hit). */
  async budget(b) {
    const { ctx, page } = await phone(b);
    await openApp(page, { sample: true });
    const r = '.budget input[type=range]';
    await page.locator(r).fill('20');
    await page.locator(r).blur();
    await scrollToEl(page, '.budget', 64);
    await sleep(900);
    const t0 = Date.now();
    await record(page, 'budget', async () => {
      await sleep(1800);
      stamp('budget', 'drag', t0);
      await dragRange(page, r, 20, 53, 3600);
      if ((await page.locator(r).inputValue()) !== '53') await page.locator(r).fill('53');
      stamp('budget', 'released', t0);
      await sleep(3600);
    });
    const v = await page.locator(r).inputValue();
    console.log('budget final value', v, '| meter:', await page.locator('.meter, .topup, [class*=meter]').first().textContent().catch(() => '?'));
    await ctx.close();
  },
  /* 8: skip a food -> new plan. */
  async exclude(b) {
    const { ctx, page } = await phone(b);
    await openApp(page, { sample: true });
    await scrollToEl(page, '.platecard', 60);
    await sleep(700);
    const t0 = Date.now();
    await record(page, 'exclude', async () => {
      await sleep(700);
      stamp('exclude', 'tap_row', t0);
      await tap(page, page.locator('.plate__row', { hasText: 'Soya chunks' }));
      await sleep(1100);
      stamp('exclude', 'tap_skip', t0);
      await tap(page, page.getByRole('button', { name: 'Don’t suggest' }));
      await sleep(600);
      stamp('exclude', 'close', t0);
      await tap(page, page.getByRole('button', { name: 'Close' }));
      await sleep(300);
      await scrollToEl(page, '.platecard', 60);
      stamp('exclude', 'new_plan', t0);
      await sleep(2600);
    });
    await ctx.close();
  },
  /* 9: shopping list. */
  async list(b) {
    const { ctx, page } = await phone(b);
    await openApp(page, { sample: true });
    await scrollToEl(page, '.platecard__actions', 360);
    await sleep(600);
    const t0 = Date.now();
    await record(page, 'list', async () => {
      await sleep(600);
      stamp('list', 'tap', t0);
      await tap(page, page.getByRole('button', { name: 'Shopping list' }));
      await sleep(1600);
      stamp('list', 'scroll', t0);
      await page.evaluate(() => window.scrollBy({ top: 260, behavior: 'smooth' }));
      await sleep(2200);
    });
    await ctx.close();
  },
  /* 10: the real embarko.ai and its "Copy deployment prompt" button. */
  async embarko(b) {
    const { ctx, page } = await phone(b, 'https://embarko.ai');
    await page.goto('https://embarko.ai/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await sleep(800);
    const btn = page.getByRole('button', { name: 'Copy deployment prompt' }).first();
    const t0 = Date.now();
    await record(page, 'embarko', async () => {
      await sleep(900);
      stamp('embarko', 'scroll', t0);
      await page.evaluate(() => {
        const e = [...document.querySelectorAll('button')].find((x) => /Copy deployment prompt/.test(x.textContent));
        window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 330, behavior: 'smooth' });
      });
      await sleep(1300);
      stamp('embarko', 'tap', t0);
      await tap(page, btn);
      await sleep(2000);
    });
    await ctx.close();
  },
  /* 12: the live app loaded by its URL (claimed app, nothing hidden), then down to "Free, no sign-up". */
  async live(b) {
    const { ctx, page } = await phone(b);
    await page.goto('about:blank');
    const t0 = Date.now();
    await record(page, 'live', async () => {
      await sleep(300);
      stamp('live', 'goto', t0);
      await page.goto(LIVE, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      stamp('live', 'loaded', t0);
      await sleep(1600);
      stamp('live', 'scroll', t0);
      await page.evaluate(() => {
        const e = [...document.querySelectorAll('p,span,small')].find((x) => /Free, no sign-up/.test(x.textContent));
        window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 300, behavior: 'smooth' });
      });
      await sleep(2600);
    });
    await ctx.close();
  },
  /* 13: Share plan -> the app's real "Link copied" toast. */
  async share(b) {
    const { ctx, page } = await phone(b);
    await openApp(page, { sample: true });
    const btn = page.getByRole('button', { name: /Share plan/ });
    await btn.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const e = [...document.querySelectorAll('button')].find((x) => /Share plan/.test(x.textContent));
      window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 300);
    });
    await sleep(700);
    const t0 = Date.now();
    await record(page, 'share', async () => {
      await sleep(700);
      stamp('share', 'tap', t0);
      await tap(page, btn);
      await sleep(2400);
    });
    await ctx.close();
  },
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(clips);
const browser = await chromium.launch();
for (const n of wanted) {
  try { await clips[n](browser); } catch (e) { console.error(`${n} FAILED: ${e.message}`); }
}
await browser.close();
const mf = resolve(OUT, 'marks.json');
let prev = {};
try { prev = JSON.parse((await import('node:fs')).readFileSync(mf, 'utf8')); } catch {}
writeFileSync(mf, JSON.stringify({ ...prev, ...marks }, null, 1));
