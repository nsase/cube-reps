import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** 履歴画面で独立して配置される主要コンポーネント。 */
const layoutItems =
  'app-history-group-panel, app-history-summary, app-history-progress-chart, app-solve-history';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/history');
  await expect(page.locator('app-history')).toBeVisible();
});

test('レスポンシブ配置が画面内に収まる', async ({ page }) => {
  await expectNoHorizontalOverflow(page);
  await expectResponsiveLayout(page, layoutItems);
});

test('途中のDNFを飛ばして前後の結果を線でつなぐ', async ({ page }) => {
  const solves = Array.from({ length: 6 }, (_, index) => ({
    id: String(index + 1),
    time: 10000 - index * 500,
    scramble: 'R U',
    date: new Date(6 - index).toISOString(),
    category: 'full',
    groupId: 'unclassified',
    penalty: index === 2 || index === 3 ? 'DNF' : 'none',
  }));
  await page.evaluate((storedSolves) => {
    localStorage.setItem('cube-stride.solves', JSON.stringify(storedSolves));
  }, solves);
  await page.reload();

  const resultPath = page.locator('.series-line.result');
  const resultPoints = page.locator('[data-series="result"]');
  await expect(resultPoints).toHaveCount(4);

  const commands = (await resultPath.getAttribute('d'))?.match(/[ML]/g);
  expect(commands).toEqual(['M', 'L', 'L', 'L']);
});
