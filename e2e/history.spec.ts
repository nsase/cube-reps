import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** 履歴画面で独立して配置される主要コンポーネント。 */
const layoutItems =
  'app-history-group-panel, app-history-summary, app-history-progress-chart, app-solve-history';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/#/history');
  await expect(page.locator('app-history')).toBeVisible();
});

test('レスポンシブ配置が画面内に収まる', async ({ page }) => {
  await expectNoHorizontalOverflow(page);
  await expectResponsiveLayout(page, layoutItems);
});
