import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** 手順一覧画面で検証するOLL・PLLルート。 */
const routes = ['algorithms/oll', 'algorithms/pll'] as const;

/** 手順一覧画面で独立して配置される主要要素。 */
const layoutItems = 'app-algorithm-tools, .count, .grid > app-algorithm-case-card';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

for (const route of routes) {
  test(`${route}画面のレスポンシブ配置が画面内に収まる`, async ({ page }) => {
    await page.goto(`/#/${route}`);
    await expect(page.locator('app-algorithms')).toBeVisible();

    await expectNoHorizontalOverflow(page);
    await expectResponsiveLayout(page, layoutItems);
  });
}
