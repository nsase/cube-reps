import { expect, test, type Locator, type Page } from '@playwright/test';

/** 主要画面と、その画面固有のルート要素。 */
const routes = [
  { path: 'timer', root: 'app-timer' },
  { path: 'algorithms/pll', root: 'app-algorithms' },
  { path: 'history', root: 'app-history' },
] as const;

/**
 * ページに横方向のはみ出しがないことを確認する。
 *
 * @param page 検証対象のブラウザページ
 */
async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const sizes = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
  }));

  expect(sizes.contentWidth).toBeLessThanOrEqual(sizes.viewportWidth);
}

/**
 * 2要素の矩形が重なっていないことを確認する。
 *
 * @param first 1つ目の要素
 * @param second 2つ目の要素
 */
async function expectNotToOverlap(first: Locator, second: Locator): Promise<void> {
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();

  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(
    firstBox!.x + firstBox!.width <= secondBox!.x ||
      secondBox!.x + secondBox!.width <= firstBox!.x ||
      firstBox!.y + firstBox!.height <= secondBox!.y ||
      secondBox!.y + secondBox!.height <= firstBox!.y,
  ).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

for (const route of routes) {
  test(`${route.path}画面が表示領域から横にはみ出さない`, async ({ page }) => {
    await page.goto(`/#/${route.path}`);

    await expect(page.locator(route.root)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test('タイマーの主要要素が割り当て領域へ収まる', async ({ page }) => {
  await page.goto('/#/timer');

  const clock = page.locator('app-timer-clock');
  const time = clock.locator('strong');
  const scramble = page.locator('app-timer-scramble');

  await expect(time).toHaveText('0.00');
  await expectNotToOverlap(clock, scramble);

  const [clockBox, timeBox] = await Promise.all([clock.boundingBox(), time.boundingBox()]);
  expect(clockBox).not.toBeNull();
  expect(timeBox).not.toBeNull();
  expect(timeBox!.width).toBeLessThanOrEqual(clockBox!.width);
  expect(timeBox!.height).toBeLessThanOrEqual(clockBox!.height);
});
