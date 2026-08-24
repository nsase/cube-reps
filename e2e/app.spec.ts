import { expect, test, type Locator, type Page } from '@playwright/test';

/** 主要画面と、レスポンシブ配置を検証する要素。 */
const routes = [
  {
    path: 'timer',
    root: 'app-timer',
    layoutItems: 'app-timer-settings, app-timer-clock, app-timer-scramble, app-timer-stats',
  },
  {
    path: 'algorithms/oll',
    root: 'app-algorithms',
    layoutItems: 'app-algorithm-tools, .count, .grid > app-algorithm-case-card',
  },
  {
    path: 'algorithms/pll',
    root: 'app-algorithms',
    layoutItems: 'app-algorithm-tools, .count, .grid > app-algorithm-case-card',
  },
  {
    path: 'history',
    root: 'app-history',
    layoutItems:
      'app-history-group-panel, app-history-summary, app-history-progress-chart, app-solve-history',
  },
] as const;

/** レイアウト検証時に比較する要素の矩形。 */
interface LayoutBox {
  label: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

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
 * 主要レイアウト要素が画面左右へはみ出さず、互いに重ならないことを確認する。
 *
 * 縦方向は一覧画面の正常なスクロールを許可し、要素同士の重なりだけを検証する。
 *
 * @param page 検証対象のブラウザページ
 * @param selector 兄弟関係にある主要レイアウト要素のセレクター
 */
async function expectResponsiveLayout(page: Page, selector: string): Promise<void> {
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const boxes = await page.locator(selector).evaluateAll((elements): LayoutBox[] =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: `${element.tagName.toLowerCase()}${
            element.className ? `.${String(element.className).trim().replaceAll(' ', '.')}` : ''
          }`,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      })
      .filter((box) => box.right > box.left && box.bottom > box.top),
  );

  expect(boxes.length).toBeGreaterThan(0);

  for (const box of boxes) {
    expect.soft(box.left, `${box.label}の左端`).toBeGreaterThanOrEqual(0);
    expect.soft(box.right, `${box.label}の右端`).toBeLessThanOrEqual(viewportWidth);
  }

  for (const [index, first] of boxes.entries()) {
    for (const second of boxes.slice(index + 1)) {
      const overlapsHorizontally =
        first.left < second.right - 0.5 && second.left < first.right - 0.5;
      const overlapsVertically = first.top < second.bottom - 0.5 && second.top < first.bottom - 0.5;

      expect
        .soft(
          overlapsHorizontally && overlapsVertically,
          `${first.label}と${second.label}が重ならないこと`,
        )
        .toBe(false);
    }
  }
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
  test(`${route.path}画面のレスポンシブ配置が収まる`, async ({ page }) => {
    await page.goto(`/#/${route.path}`);

    await expect(page.locator(route.root)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectResponsiveLayout(page, route.layoutItems);
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
