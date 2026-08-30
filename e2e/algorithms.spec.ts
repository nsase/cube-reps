import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** 手順一覧画面で検証するOLL・PLLルート。 */
const routes = ['algorithms/oll', 'algorithms/pll'] as const;

/** 手順一覧画面で独立して配置される主要要素。 */
const layoutItems = 'app-algorithm-tools, .count, .grid > app-algorithm-case-card';

test.describe('レスポンシブ表示', { tag: '@responsive' }, () => {
  for (const route of routes) {
    test(`${route}画面のレスポンシブ配置が画面内に収まる`, async ({ page }) => {
      await page.goto(`/#/${route}`);
      await expect(page.locator('app-algorithms')).toBeVisible();

      await expectNoHorizontalOverflow(page);
      await expectResponsiveLayout(page, layoutItems);
    });

    test(`${route}画面で操作欄がスクロール中も上部に表示される`, async ({ page }) => {
      await page.goto(`/#/${route}`);
      const tools = page.locator('app-algorithm-tools');
      await expect(tools).toBeVisible();

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

      await expect.poll(async () => (await tools.boundingBox())?.y).toBeGreaterThanOrEqual(0);
      expect((await tools.boundingBox())?.y).toBeLessThanOrEqual(1);
    });

    test(`${route}画面の狭幅では切替と検索を1行に表示する`, async ({ page }) => {
      test.skip((page.viewportSize()?.width ?? 0) > 620, 'スマートフォン幅だけで検証する');
      await page.goto(`/#/${route}`);
      const selector = page.locator('app-algorithm-tools .kind-selector');
      const search = page.locator('app-algorithm-tools label');

      const selectorBox = await selector.boundingBox();
      const searchBox = await search.boundingBox();

      expect(selectorBox).not.toBeNull();
      expect(searchBox).not.toBeNull();
      expect(Math.abs(selectorBox!.y - searchBox!.y)).toBeLessThanOrEqual(1);
      const caseCounts = page.locator('app-algorithm-tools button small');
      await expect(caseCounts).toHaveCount(2);
      await expect(caseCounts.first()).toBeHidden();
      await expect(caseCounts.last()).toBeHidden();
      await expectNoHorizontalOverflow(page);
    });
  }
});
