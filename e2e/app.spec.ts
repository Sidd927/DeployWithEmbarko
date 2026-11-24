import { expect, test, type Page } from '@playwright/test';

/* Collect console errors and failed requests for every test. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
  return problems;
}

async function noHorizontalOverflow(page: Page) {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(sw, 'page must not scroll sideways').toBeLessThanOrEqual(cw);
}

async function buildPlan(
  page: Page,
  o: { weight: string; goal: RegExp; diet: RegExp; kitchen: RegExp; meals: string; quality?: RegExp },
) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Build my plan' }).click();
  const w = page.getByLabel('Weight in kilograms');
  await w.fill(o.weight);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: o.goal }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: o.diet }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: o.kitchen }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('radio', { name: o.meals, exact: true }).click();
  if (o.quality) await page.getByRole('button', { name: o.quality }).click();
  await page.getByRole('button', { name: 'Show my packs' }).click();
}

async function plateNames(page: Page) {
  return page.locator('.plate__name').allTextContents();
}

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test('landing explains the product and the live demo responds', async ({ page }, info) => {
  const problems = watch(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hit your protein on a hostel budget.');
  const price = page.locator('.hero__demo .voucher__price');
  await expect(price).toContainText('29');
  await page.locator('.hero__demo input[type=range]').fill('70');
  await expect(price).toContainText('70');
  await expect(page.locator('.hero__demo .voucher__pct')).toHaveText('Goal covered');
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `qa/screenshots/${info.project.name}-01-landing.png`, fullPage: true });
  expect(problems).toEqual([]);
});

test('setup journey builds a diet- and kitchen-correct plan', async ({ page }, info) => {
  const problems = watch(page);
  await buildPlan(page, {
    weight: '72',
    goal: /Building muscle/,
    diet: /^Vegetarian/,
    kitchen: /^Nothing/,
    meals: '3',
    quality: /Typical/,
  });
  // 72 kg x 1.6 = 115 g goal, 3 x 15 = 45 g from meals, 70 g top-up
  await expect(page.locator('.equation')).toContainText('115 g');
  await expect(page.locator('.equation')).toContainText('70 g');
  const names = await plateNames(page);
  expect(names.length).toBeGreaterThan(0);
  // vegetarian, no kitchen: no eggs, chicken, soya (kettle), dal (stove)
  for (const banned of ['Eggs', 'Chicken breast', 'Soya chunks', 'Moong dal', 'Oats']) {
    expect(names).not.toContain(banned);
  }
  await expect(page.locator('.meter__status')).toContainText('Goal hit');
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `qa/screenshots/${info.project.name}-02-plan.png`, fullPage: true });
  expect(problems).toEqual([]);
});

test('weight validation explains the valid range', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await page.getByLabel('Weight in kilograms').fill('12');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('alert')).toHaveText('Enter a weight between 30 and 200 kg.');
  await page.getByLabel('Weight in kilograms').fill('64');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What are you eating protein for?');
});

test('budget slider re-optimises the plate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open a sample plan' }).click();
  await expect(page.locator('.meter__status')).toContainText('Goal hit');
  const slider = page.locator('.budget input[type=range]');
  await slider.fill('15');
  await expect(page.locator('.budget__value')).toHaveText('₹15');
  await expect(page.locator('.meter__status')).toContainText('short');
  const cost = await page.locator('.totals dd').first().textContent();
  expect(Number(cost!.replace(/[^\d.]/g, ''))).toBeLessThanOrEqual(15);
  await page.getByRole('button', { name: 'Jump there' }).click();
  await expect(page.locator('.meter__status')).toContainText('Goal hit');
});

test('packs select a budget', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open a sample plan' }).click();
  const partial = page.locator('.packs .voucher').first();
  await partial.click();
  await expect(partial).toHaveAttribute('aria-pressed', 'true');
  const label = await partial.locator('.voucher__price').textContent();
  await expect(page.locator('.budget__value')).toHaveText(`₹${label!.replace(/[^\d]/g, '')}`);
});

test('excluding and pinning foods changes the plan; prices persist', async ({ page }, info) => {
  const problems = watch(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open a sample plan' }).click();
  expect(await plateNames(page)).toContain('Soya chunks');

  await page.locator('.tabs:visible').getByRole('button', { name: 'Foods' }).click();
  await page.locator('.foodrow', { hasText: 'Soya chunks' }).click();
  await page.getByRole('button', { name: 'Don’t suggest' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.locator('.foodrow', { hasText: 'Toned milk' }).click();
  await page.getByRole('button', { name: 'Always include' }).click();
  await page.getByLabel('Price (₹)').fill('20');
  await page.getByRole('button', { name: 'Save price' }).click();
  await expect(page.locator('.foodrow', { hasText: 'Toned milk' })).toContainText('your price');
  await page.screenshot({ path: `qa/screenshots/${info.project.name}-03-foods.png`, fullPage: true });

  await page.locator('.tabs:visible').getByRole('button', { name: 'Plan' }).click();
  let names = await plateNames(page);
  expect(names).not.toContain('Soya chunks');
  expect(names).toContain('Toned milk');

  await page.reload();
  names = await plateNames(page);
  expect(names).not.toContain('Soya chunks');
  expect(names).toContain('Toned milk');

  await page.locator('.tabs:visible').getByRole('button', { name: 'Foods' }).click();
  await page.getByRole('button', { name: /Reset 1 price/ }).click();
  await expect(page.locator('.foodrow', { hasText: 'Toned milk' })).not.toContainText('your price');
  expect(problems).toEqual([]);
});

test('shopping list rounds to packs and copies', async ({ page, context }, info) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open a sample plan' }).click();
  await page.getByRole('button', { name: 'Shopping list' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Weekly shopping list');
  const rows = page.locator('.shop__row');
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(rows.first()).toContainText('Buy');
  await page.screenshot({ path: `qa/screenshots/${info.project.name}-04-list.png`, fullPage: true });
  await page.getByRole('button', { name: 'Copy list' }).click();
  await expect(page.locator('.toast')).toHaveText('List copied');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('First shop:');
});

test('share links rebuild the profile with a banner', async ({ page }) => {
  // 70 kg, active, nonveg, stove, 1 meal, light
  const code = Buffer.from('70.active.nonveg.stove.1.light').toString('base64').replace(/=+$/, '');
  await page.goto(`/#p=${code}`);
  await expect(page.getByText('Someone shared this plan with you')).toBeVisible();
  // 70 x 1.2 = 84 goal, 10 from meals
  await expect(page.locator('.equation')).toContainText('84 g');
  await expect(page.locator('.equation')).toContainText('74 g');
  expect(page.url()).not.toContain('#p=');
});

test('meals that already cover the goal show a clear empty state', async ({ page }) => {
  await buildPlan(page, {
    weight: '40',
    goal: /Stay healthy/,
    diet: /^Vegetarian/,
    kitchen: /^Nothing/,
    meals: '3',
    quality: /Good/,
  });
  await expect(page.getByRole('heading', { name: 'Your meals already cover your goal.' })).toBeVisible();
});

test('a goal that cannot be reached explains why', async ({ page }) => {
  await buildPlan(page, {
    weight: '200',
    goal: /Building muscle/,
    diet: /^Vegan/,
    kitchen: /^Nothing/,
    meals: '0',
  });
  await expect(page.locator('.budget__note')).toContainText('can’t be reached');
  await expect(page.locator('.reasons')).toContainText('A kettle unlocks');
  await expect(page.locator('.packs .voucher').last()).toContainText('Most you can reach');
});

test('keyboard: sheet closes with Escape and returns focus', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'keyboard check on desktop');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open a sample plan' }).click();
  const row = page.locator('.plate__row').first();
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(row).toBeFocused();
});
