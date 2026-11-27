// Captures real footage for the demo video with Chrome's screencast (crisp 3x frames).
// Usage: node scripts/capture.mjs [clip ...]   (default: all clips)
// Output: video/footage/<clip>.mp4 at 30 fps, 1170x2532 (phone) frames.
import { chromium } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const LIVE = 'https://protein-recharge.embarko.app/';
const OUT = resolve('video/footage');
const TMP = resolve('video/work/frames');
const FFMPEG = '/opt/homebrew/bin/ffmpeg';
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Visible touch indicator so viewers can follow taps and drags. */
const TOUCH_JS = `
(() => {
  if (window.__touchViz) return; window.__touchViz = true;
  const s = document.createElement('style');
  s.textContent = '.__t{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(20,36,30,.28);border:3px solid rgba(20,36,30,.75);pointer-events:none;z-index:2147483647;transition:transform .25s,opacity .35s}.__t.up{transform:scale(1.6);opacity:0}';
  document.documentElement.appendChild(s);
  let dot = null;
  const place = (e) => { if (!dot) return; dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; };
  addEventListener('pointerdown', (e) => { dot = document.createElement('div'); dot.className='__t'; document.documentElement.appendChild(dot); place(e); }, true);
  addEventListener('pointermove', (e) => place(e), true);
  addEventListener('pointerup', () => { const d = dot; dot = null; if (d) { d.classList.add('up'); setTimeout(() => d.remove(), 400); } }, true);
})();`;

/* Embarko shows a "will be deleted in N hours" banner only while an app is unclaimed.
   We hide that temporary banner in product shots. Embarko's badge stays (it is non-dismissable by design). */
const HIDE_ORPHAN_CSS = '#__embarko_orphan_banner{display:none!important}';

async function newPhone(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36',
  });
  await ctx.addInitScript(TOUCH_JS);
  const page = await ctx.newPage();
  return { ctx, page };
}

async function record(page, name, fn) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp });
    try {
      await cdp.send('Page.screencastFrameAck', { sessionId });
    } catch {}
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1170, maxHeight: 2532 });
  const t0 = Date.now() / 1000;
  await fn();
  await sleep(300);
  await cdp.send('Page.stopScreencast');
  const tEnd = Date.now() / 1000;
  if (!frames.length) throw new Error(`no frames for ${name}`);

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
  execFileSync(FFMPEG, [
    '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', resolve(dir, 'list.txt'),
    '-vf', 'fps=30,scale=1170:-2:flags=lanczos,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-movflags', '+faststart', out,
  ]);
  const dur = execFileSync('/opt/homebrew/bin/ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
  console.log(`${name}: ${frames.length} frames, ${Number(dur).toFixed(1)} s -> ${out}`);
}

async function tap(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await sleep(120);
  const box = await locator.boundingBox();
  if (!box) throw new Error('no box');
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

/* Drag a range input from one value to another with a visible finger. */
async function dragRange(page, selector, from, to, ms) {
  const el = page.locator(selector);
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  const { min, max } = await el.evaluate((n) => ({ min: Number(n.min), max: Number(n.max) }));
  const thumb = 28;
  const x = (v) => box.x + thumb / 2 + ((v - min) / (max - min)) * (box.width - thumb);
  const y = box.y + box.height / 2;
  await page.mouse.move(x(from), y);
  await page.mouse.down();
  const steps = Math.max(10, Math.round(ms / 33));
  for (let i = 1; i <= steps; i++) {
    const e = i / steps;
    const eased = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
    await page.mouse.move(x(from + (to - from) * eased), y);
    await sleep(ms / steps);
  }
  await page.mouse.up();
}

async function setRange(page, selector, v) {
  await page.locator(selector).fill(String(v));
  await page.locator(selector).blur();
}

async function openApp(page, { sample = false } = {}) {
  await page.goto(LIVE, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: HIDE_ORPHAN_CSS });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.addStyleTag({ content: HIDE_ORPHAN_CSS });
  await page.evaluate(() => document.fonts.ready);
  if (sample) {
    await page.getByRole('button', { name: 'Open a sample plan' }).click();
    await page.waitForSelector('.plate__row');
  }
}

const clips = {
  /* Landing hero: the live demo voucher reacting to the budget slider. */
  async hook(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page);
    await page.evaluate(() => {
      const d = document.querySelector('.hero__demo');
      window.scrollTo(0, d.getBoundingClientRect().top + window.scrollY - 24);
    });
    await setRange(page, '.hero__demo input[type=range]', 20);
    await sleep(400);
    await record(page, 'hook', async () => {
      await sleep(700);
      await dragRange(page, '.hero__demo input[type=range]', 20, 62, 3200);
      await sleep(1400);
    });
    await ctx.close();
  },

  /* Foods ranking: protein per ₹10, soya at the top, then a smooth scroll to whey and paneer. */
  async rank(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page, { sample: true });
    await page.addStyleTag({ content: '.banner--sample{display:none!important}' });
    await page.locator('.tabs--bottom').getByRole('button', { name: 'Foods' }).click();
    await page.waitForSelector('.foodrow');
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(600);
    await record(page, 'rank', async () => {
      await sleep(1600);
      await page.evaluate(() => {
        const w = [...document.querySelectorAll('.foodrow')].find((r) => r.textContent.includes('Whey protein'));
        const y = w.getBoundingClientRect().top + window.scrollY - 300;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
      await sleep(2600);
    });
    await ctx.close();
  },

  /* The claimed live app, loaded fresh by URL (no overlays hidden). */
  async live(browser) {
    const { ctx, page } = await newPhone(browser);
    await page.goto('about:blank');
    await record(page, 'live', async () => {
      await page.goto(LIVE, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await sleep(1500);
      await page.evaluate(() => window.scrollTo({ top: 560, behavior: 'smooth' }));
      await sleep(2200);
    });
    await ctx.close();
  },

  /* Landing first screen, still. */
  async landing(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page);
    await record(page, 'landing', async () => {
      await sleep(1800);
      await page.mouse.wheel(0, 0);
    });
    await ctx.close();
  },

  /* Five-question setup, tapped through. */
  async setup(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page);
    await record(page, 'setup', async () => {
      await sleep(600);
      await tap(page, page.getByRole('button', { name: 'Build my plan' }));
      await sleep(700);
      const w = page.getByLabel('Weight in kilograms');
      await tap(page, w);
      await w.fill('');
      await page.keyboard.type('68', { delay: 220 });
      await sleep(400);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(600);
      await tap(page, page.getByRole('button', { name: /Building muscle/ }));
      await sleep(450);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(600);
      await tap(page, page.getByRole('button', { name: /Veg \+ eggs/ }));
      await sleep(450);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(600);
      await tap(page, page.getByRole('button', { name: /Electric kettle/ }));
      await sleep(450);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      await sleep(600);
      await tap(page, page.getByRole('radio', { name: '2', exact: true }));
      await sleep(900);
      await tap(page, page.getByRole('button', { name: 'Show my packs' }));
      await sleep(1800);
    });
    await ctx.close();
  },

  /* The wow moment: drag the budget, the plate rebuilds, the goal is hit. */
  async slider(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page, { sample: true });
    await page.getByRole('button', { name: 'Build my own plan' }).isVisible();
    await page.addStyleTag({ content: '.banner--sample{display:none!important}' });
    await setRange(page, '.budget input[type=range]', 12);
    await page.evaluate(() => {
      const el = document.querySelector('.budget');
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 12);
    });
    await sleep(800);
    await record(page, 'slider', async () => {
      await sleep(600);
      await dragRange(page, '.budget input[type=range]', 12, 53, 4200);
      // pixel rounding can leave the thumb one rupee short: land exactly on the goal price
      if ((await page.locator('.budget input[type=range]').inputValue()) !== '53') {
        await page.locator('.budget input[type=range]').fill('53');
      }
      await sleep(2400);
    });
    await ctx.close();
  },

  /* Packs strip + plate, then exclude soya and watch it re-plan. */
  async exclude(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page, { sample: true });
    await page.addStyleTag({ content: '.banner--sample{display:none!important}' });
    await page.evaluate(() => {
      const el = document.querySelector('.platecard');
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 12);
    });
    await sleep(600);
    await record(page, 'exclude', async () => {
      await sleep(900);
      await tap(page, page.locator('.plate__row', { hasText: 'Soya chunks' }));
      await sleep(1400);
      await tap(page, page.getByRole('button', { name: 'Don’t suggest' }));
      await sleep(700);
      await tap(page, page.getByRole('button', { name: 'Close' }));
      await sleep(400);
      await page.evaluate(() => {
        const el = document.querySelector('.platecard');
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 12 });
      });
      await sleep(2200);
    });
    await ctx.close();
  },

  /* Plan screen top: equation + recharge packs. */
  async packs(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page, { sample: true });
    await page.addStyleTag({ content: '.banner--sample{display:none!important}' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.packs').evaluate((s) => s.scrollTo({ left: 0 }));
    await sleep(500);
    await record(page, 'packs', async () => {
      await sleep(800);
      await page.locator('.packs').evaluate((s) => s.scrollTo({ left: s.scrollWidth, behavior: 'smooth' }));
      await sleep(1600);
      await tap(page, page.locator('.packs .voucher').first());
      await sleep(1300);
      await tap(page, page.locator('.packs .voucher').last());
      await sleep(1400);
    });
    await ctx.close();
  },

  /* Shopping list. */
  async list(browser) {
    const { ctx, page } = await newPhone(browser);
    await openApp(page, { sample: true });
    await page.addStyleTag({ content: '.banner--sample{display:none!important}' });
    await page.evaluate(() => {
      const el = document.querySelector('.platecard__actions');
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 500);
    });
    await sleep(500);
    await record(page, 'list', async () => {
      await sleep(700);
      await tap(page, page.getByRole('button', { name: 'Shopping list' }));
      await sleep(2200);
      await page.mouse.wheel(0, 380);
      await sleep(1800);
    });
    await ctx.close();
  },

  /* The real Embarko homepage and its "Copy deployment prompt" button. */
  async embarko(browser) {
    const { ctx, page } = await newPhone(browser);
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://embarko.ai' });
    await page.goto('https://embarko.ai/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await sleep(800);
    const btn = page.getByRole('button', { name: 'Copy deployment prompt' }).first();
    await record(page, 'embarko', async () => {
      await sleep(1500);
      await btn.scrollIntoViewIfNeeded();
      await sleep(800);
      await tap(page, btn);
      await sleep(2200);
    });
    const copied = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
    writeFileSync(resolve(OUT, 'embarko-copied-prompt.txt'), copied);
    await ctx.close();
  },

  /* A real redeploy, its real output streamed into a terminal view as it happens. */
  async deploy(browser) {
    const { ctx, page } = await newPhone(browser);
    const termHtml = resolve('video/work/terminal.html');
    writeFileSync(
      termHtml,
      `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      body{margin:0;background:#14241E;color:#E6EAEA;font:500 13.5px/1.5 ui-monospace,Menlo,monospace;padding:20px 16px;min-height:100vh;box-sizing:border-box}
      .bar{display:flex;gap:7px;margin-bottom:14px}.bar i{width:11px;height:11px;border-radius:50%;background:#4D5D57}
      .title{color:#9fb0aa;font:600 12px/1.4 -apple-system,system-ui,sans-serif;margin-bottom:14px}
      pre{margin:0;white-space:pre-wrap;word-break:break-word}.c{color:#FFC21A}.ok{color:#7fd6a4}.dim{color:#9fb0aa}
      </style></head><body><div class="bar"><i></i><i></i><i></i></div>
      <div class="title">claude-code &rarr; ship.embarko.ai &middot; real run, ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</div><pre id="o"></pre></body></html>`,
    );
    await page.goto(pathToFileURL(termHtml).href);
    const add = (html) =>
      page.evaluate((h) => {
        const o = document.getElementById('o');
        o.insertAdjacentHTML('beforeend', h);
        window.scrollTo(0, document.body.scrollHeight);
      }, html);
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const typeCmd = async (cmd) => {
      await add('<span class="c">$ </span>');
      for (const ch of cmd) {
        await add(esc(ch));
        await sleep(14);
      }
      await add('\n');
    };
    const run = (cmd, args) =>
      new Promise((res, rej) => {
        const p = spawn(cmd, args);
        let out = '';
        p.stdout.on('data', (d) => (out += d));
        p.stderr.on('data', (d) => (out += d));
        p.on('close', (code) => (code === 0 ? res(out) : rej(new Error(out))));
      });
    const files = ['package.json', 'package-lock.json', 'index.html', 'vite.config.ts', 'tsconfig.json', 'embarko.json', 'src', 'public'];
    const appId = JSON.parse(readFileSync('embarko.json', 'utf8')).appId;
    const log = [];
    await record(page, 'deploy', async () => {
      await sleep(600);
      await typeCmd(`tar -czf /tmp/app.tar.gz --exclude='*.test.ts' ${files.join(' ')}`);
      await run('tar', ['-czf', '/tmp/app.tar.gz', '--exclude=*.test.ts', ...files]);
      await sleep(300);
      await typeCmd(
        `curl -sS -X POST https://ship.embarko.ai/apps -H 'X-App-Name: protein-recharge' -H 'X-Agent-Name: claude-code' -F source=@/tmp/app.tar.gz`,
      );
      const reply = await run('curl', [
        '-sS', '-X', 'POST', 'https://ship.embarko.ai/apps',
        '-H', 'X-App-Name: protein-recharge', '-H', 'X-Agent-Name: claude-code', '-H', `X-App-Id: ${appId}`,
        '-F', 'source=@/tmp/app.tar.gz',
      ]);
      log.push(reply);
      const r = JSON.parse(reply);
      if (r.links) delete r.links.claim; // never show a claim code on screen
      await add(
        `<span class="dim">${esc(JSON.stringify({ success: r.success, status: r.status, app: { name: r.app?.name, kind: r.app?.kind }, action: r.action }, null, 1))}</span>\n`,
      );
      for (let i = 0; i < 30; i++) {
        await sleep(10000);
        const s = JSON.parse(await run('curl', ['-sS', 'https://ship.embarko.ai/apps/protein-recharge/status']));
        log.push(JSON.stringify(s));
        const live = s.status === 'live' && s.deploy?.status === 'success';
        await add(`<span class="dim">status:</span> <span class="${live ? 'ok' : ''}">${esc(s.status)}${s.deploy?.status ? ' (' + esc(s.deploy.status) + ')' : ''}</span>\n`);
        if (live) {
          await add(`\n<span class="ok">Live: https://protein-recharge.embarko.app</span>\n`);
          break;
        }
        if (['failed', 'crashed'].includes(s.status)) break;
      }
      await sleep(2200);
    });
    writeFileSync(resolve(OUT, 'deploy-log.jsonl'), log.map((l) => l.replace(/code=[^"&]+/g, 'code=<REDACTED>')).join('\n') + '\n');
    await ctx.close();
  },
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(clips);
const browser = await chromium.launch();
for (const name of wanted) {
  try {
    await clips[name](browser);
  } catch (e) {
    console.error(`${name} FAILED: ${e.message}`);
  }
}
await browser.close();
