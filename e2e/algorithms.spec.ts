import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** 手順一覧画面で検証するOLL・PLLルート。 */
const routes = ['algorithms/oll', 'algorithms/pll'] as const;

/** 手順一覧画面で独立して配置される主要要素。 */
const layoutItems = 'app-algorithm-tools, .grid > app-algorithm-case-card';

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

    test(`${route}画面の切替ボタン内でケース数を折り返さない`, async ({ page }) => {
      await page.goto(`/#/${route}`);

      const sameLineResults = await page.locator('app-algorithm-tools a').evaluateAll((buttons) =>
        buttons.map((button) => {
          const labelNode = button.firstChild;
          const count = button.querySelector('small');
          if (!labelNode || !count || getComputedStyle(count).display === 'none') {
            return true;
          }
          const labelRange = document.createRange();
          labelRange.selectNode(labelNode);
          const labelBox = labelRange.getBoundingClientRect();
          const countBox = count.getBoundingClientRect();
          return labelBox.top < countBox.bottom && countBox.top < labelBox.bottom;
        }),
      );

      expect(sameLineResults).not.toContain(false);
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
      const caseCounts = page.locator('app-algorithm-tools a small');
      await expect(caseCounts).toHaveCount(2);
      await expect(caseCounts.first()).toBeHidden();
      await expect(caseCounts.last()).toBeHidden();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe('アルゴリズムの画面遷移', { tag: '@responsive' }, () => {
  test('メニュー・選択画面・各種別を移動できる', async ({ page }) => {
    await page.goto('/#/timer');
    const menu = page.getByTestId('algorithms-link');
    await expect(menu).toHaveAccessibleName('Algorithms');
    if ((page.viewportSize()?.width ?? 0) > 900) {
      const submenu = page.getByTestId('algorithm-submenu');
      for (const kind of ['F2L', 'OLL', 'PLL']) {
        await submenu.getByRole('link', { name: kind, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/algorithms/${kind.toLowerCase()}$`));
        await expect(submenu.getByRole('link', { name: kind, exact: true })).toHaveAttribute(
          'aria-current',
          'page',
        );
      }
      await expectResponsiveLayout(page, 'app-nav a');
    } else {
      await expect(page.getByTestId('algorithm-submenu')).toBeHidden();
    }
    await menu.click();
    await expect(page).toHaveURL(/\/algorithms$/);
    await expect(page.locator('app-algorithm-choice')).toHaveCount(3);
    await expectResponsiveLayout(page, 'app-algorithm-choice');
    for (const kind of ['F2L', 'OLL', 'PLL']) {
      const choice = page
        .locator('app-algorithm-choice')
        .getByRole('link', { name: new RegExp(`^${kind}`) });
      await choice.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/algorithms/${kind.toLowerCase()}$`));
      if (kind === 'F2L') {
        await expect(page.locator('app-f2l-case-card')).toHaveCount(41);
        await expect(
          page.getByText('Solve and Setup are dummy algorithms', { exact: false }),
        ).toBeVisible();
      } else {
        await expect(page.locator('app-algorithm-case-card')).toHaveCount(kind === 'OLL' ? 57 : 21);
      }
      await expectNoHorizontalOverflow(page);
      await expectResponsiveLayout(page, 'app-algorithm-kind-links button');
      await page
        .locator('app-algorithm-kind-links')
        .getByRole('button', { name: 'F2L 41', exact: true })
        .click();
      await expect(page).toHaveURL(/\/algorithms\/f2l$/);
      await menu.click();
    }
    await expectResponsiveLayout(page, 'app-nav a');
    await expectNoHorizontalOverflow(page);
  });
});

test('F2Lの41カードを最後まで閲覧できる', { tag: '@responsive' }, async ({ page }) => {
  await page.goto('/#/algorithms/f2l');
  const cards = page.locator('app-f2l-case-card');
  await expect(cards).toHaveCount(41);
  await expect(cards.first().getByRole('heading')).toHaveText('F2L 1');
  await cards.last().scrollIntoViewIfNeeded();
  await expect(cards.last().getByRole('heading')).toHaveText('F2L 41');
  await expect(cards.last().getByText("R U R'", { exact: true })).toBeVisible();
  await expect(cards.last().getByText("R U' R'", { exact: true })).toBeVisible();
  await expectResponsiveLayout(page, 'app-f2l-case-card');
  const search = page.locator('app-algorithm-tools input');
  await search.fill('41');
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole('heading')).toHaveText('F2L 41');
  await search.clear();
  await expect(cards).toHaveCount(41);
  await expectNoHorizontalOverflow(page);
});
