import { expect, test } from '@playwright/test';

test('本番とローカルPWAをタイトルとインストール名で区別できる', async ({ page }) => {
  for (const [origin, name] of [
    ['http://127.0.0.1:4300', 'CubeReps'],
    ['http://localhost:4400', 'CubeReps-local'],
  ]) {
    await page.goto(`${origin}/#/timer`);
    await expect(page).toHaveTitle(name);
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
      'content',
      name,
    );
    const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute('href');
    const response = await page.request.get(new URL(manifestUrl!, `${origin}/`).href);
    expect(response.ok()).toBe(true);
    expect(await response.json()).toMatchObject({ name, short_name: name });
    await page.evaluate(async () => navigator.serviceWorker.ready);
  }
});

test('Manifestがインストールに必要な情報とアイコンを提供する', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();

  expect(manifest).toMatchObject({
    name: 'CubeReps',
    short_name: 'CubeReps',
    start_url: './#/timer',
    display: 'standalone',
    theme_color: '#181a17',
    background_color: '#f4f3ef',
  });
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192', purpose: 'any' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'any' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
    ]),
  );

  for (const icon of manifest.icons) {
    expect((await request.get(`/${icon.src}`)).ok()).toBe(true);
  }
});

test('一度読み込んだアプリを記録を保持したままオフラインで再起動する', async ({
  context,
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/#/timer');
  await expect(page.locator('app-timer')).toBeVisible();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload();
  }
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  await expect(page.getByTestId('timer-scramble-refresh')).toBeEnabled({ timeout: 15_000 });
  const clock = page.locator('app-timer-clock .clock');
  await page.keyboard.down('Space');
  await expect(clock).toHaveClass(/\bready\b/);
  await page.keyboard.up('Space');
  await expect(clock.locator('strong')).not.toHaveText('0.00');
  await page.keyboard.press('Space');
  await page.getByRole('link', { name: 'History', exact: true }).click();
  await expect(page.locator('app-solve-record')).toHaveCount(1);

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('app-history')).toBeVisible();
    await expect(page.locator('app-solve-record')).toHaveCount(1);
  } finally {
    await context.setOffline(false);
  }
});
