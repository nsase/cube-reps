import { expect, test } from '@playwright/test';

import {
  expectElementsWithin,
  expectNoHorizontalOverflow,
  expectResponsiveLayout,
} from './support/layout';

/** 手順一覧画面で検証するF2L・OLL・PLLルート。 */
const routes = ['algorithms/f2l', 'algorithms/oll', 'algorithms/pll'] as const;

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

      const buttons = page.locator('app-algorithm-kind-links button');
      await expect(buttons).toHaveCount(3);
      const sameLineResults = await buttons.evaluateAll((buttons) =>
        buttons.map((button) => {
          const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
          let labelNode: Node | null = walker.nextNode();
          while (labelNode && !/^(F2L|OLL|PLL)$/.test(labelNode.textContent?.trim() ?? '')) {
            labelNode = walker.nextNode();
          }
          const count = button.querySelector('small');
          if (!labelNode || !count) return false;
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
      const caseCounts = page.locator('app-algorithm-kind-links button small');
      await expect(caseCounts).toHaveText(['41', '57', '21']);
      for (const count of await caseCounts.all()) await expect(count).toBeVisible();
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
        await expect(page.locator('app-algorithm-case-card')).toHaveCount(41);
        await expect(page.locator('app-cube-quarter-view')).toHaveCount(41);
        await expect(page.locator('app-cube-pattern')).toHaveCount(0);
        await expect(
          page.getByText('Some Solve and Setup algorithms are still placeholders', {
            exact: false,
          }),
        ).toBeVisible();
      } else {
        await expect(page.locator('app-algorithm-case-card')).toHaveCount(kind === 'OLL' ? 57 : 21);
        await expect(page.locator('app-cube-pattern')).toHaveCount(kind === 'OLL' ? 57 : 21);
        await expect(page.locator('app-cube-quarter-view')).toHaveCount(0);
      }
      await expectNoHorizontalOverflow(page);
      await expectResponsiveLayout(page, 'app-algorithm-kind-links button');
      await page
        .locator('app-algorithm-kind-links')
        .getByRole('radio', { name: 'F2L 41', exact: true })
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
  const cards = page.locator('app-algorithm-case-card');
  await expect(cards).toHaveCount(41);
  await expect(cards.first().locator('.number > .number')).toHaveText('01');
  await expect(
    cards
      .first()
      .getByRole('img', { name: 'Quarter view for F2L 01: top, front, and right faces' }),
  ).toBeVisible();
  await cards.last().scrollIntoViewIfNeeded();
  await expect(cards.last().locator('.number > .number')).toHaveText('41');
  await expect(
    cards.last().getByRole('img', { name: 'Quarter view for F2L 41: top, front, and right faces' }),
  ).toBeVisible();
  await expect(cards.last().getByRole('button', { name: 'Add', exact: true })).toBeVisible();

  await expectResponsiveLayout(page, 'app-algorithm-case-card');
  await expectResponsiveLayout(
    page,
    'app-algorithm-case-card .pattern app-cube-quarter-view svg, app-algorithm-case-card .pattern .group',
  );
  const search = page.locator('app-algorithm-tools input');
  await search.fill('41');
  await expect(cards).toHaveCount(1);
  await expect(cards.locator('.number > .number')).toHaveText('41');
  await search.clear();
  await expect(cards).toHaveCount(41);
  await expectNoHorizontalOverflow(page);
});

test(
  'F2Lの4スロットでSetupと手順を切り替え、お気に入りを分けて保存する',
  { tag: '@responsive' },
  async ({ page }) => {
    await page.goto('/#/algorithms/f2l');
    await page.locator('app-algorithm-tools input').fill('01');
    const card = page.locator('app-algorithm-case-card');
    await expectElementsWithin(
      page,
      'app-algorithm-case-card mat-card-content',
      'app-algorithm-case-card .slots button',
    );
    const custom = 'R2 U2 R2 U2 R2 U2';
    const frSetup = await card.locator('.setup').innerText();
    for (const [slot, rotation] of [
      ['Front Left', 'y'],
      ['Back Left', 'y2'],
      ['Back Right', "y'"],
    ] as const) {
      await card.getByRole('radio', { name: slot, exact: true }).click();
      await expect(card.locator('.setup')).toHaveText(`${frSetup.trim()} ${rotation}`);
      await expect(card.locator('app-algorithm-row').first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
    await card.getByRole('radio', { name: 'Back Left', exact: true }).click();
    await card.getByPlaceholder('Enter a new algorithm').fill(custom);
    await card.getByRole('button', { name: 'Add', exact: true }).click();
    const customRow = card.locator('app-algorithm-row').filter({ hasText: custom });
    await customRow.getByRole('button', { name: 'Set as favorite', exact: true }).click();
    await card.getByRole('radio', { name: 'Front Right', exact: true }).click();
    await expect(customRow).toHaveCount(0);
    await page.reload();
    await page.locator('app-algorithm-tools input').fill('01');
    await card.getByRole('radio', { name: 'Back Left', exact: true }).click();
    await expect(card.locator('.favorite-algorithm code')).toHaveText(custom);
  },
);

test('F2Lの共通カードで手順とお気に入りを保存し、再読込後に削除できる', async ({ page }) => {
  await page.goto('/#/algorithms/f2l');
  await page.locator('app-algorithm-tools input').fill('01');
  const card = page.locator('app-algorithm-case-card');
  await expect(card).toHaveCount(1);
  const rows = card.locator('app-algorithm-row');
  await expect(rows.first()).toBeVisible();
  const builtInCount = await rows.count();
  const originalFavorite = await card.locator('.favorite-algorithm code').innerText();
  const customNotation = 'R2 U2 R2 U2 R2 U2';
  await card.getByPlaceholder('Enter a new algorithm').fill(customNotation);
  await card.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(rows).toHaveCount(builtInCount + 1);
  const customRow = rows.filter({ hasText: customNotation });
  await customRow.getByRole('button', { name: 'Set as favorite', exact: true }).click();
  await expect(card.locator('.favorite-algorithm code')).toHaveText(customNotation);
  await page.reload();
  await page.locator('app-algorithm-tools input').fill('01');
  await expect(card.locator('.favorite-algorithm code')).toHaveText(customNotation);
  await customRow.getByRole('button', { name: 'Delete custom algorithm', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(rows).toHaveCount(builtInCount);
  await expect(card.locator('.favorite-algorithm code')).toHaveText(originalFavorite);
});

test('iPhone SE幅で4スロット名を1行に表示し、すべて選択できる', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/#/algorithms/f2l');
  await page.locator('app-algorithm-tools input').fill('01');
  const slots = page.locator('app-algorithm-case-card .slots');
  const buttons = slots.getByRole('radio');
  await expect(slots.locator('.full-label:visible')).toHaveText([
    'Front Right',
    'Front Left',
    'Back Left',
    'Back Right',
  ]);
  await expect(slots.locator('.short-label:visible')).toHaveCount(0);
  const bounds = await slots.boundingBox();
  const content = await page.locator('app-algorithm-case-card mat-card-content').boundingBox();
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(content!.x + content!.width);
  for (const button of await buttons.all()) {
    await button.click();
    await expect(button).toHaveAttribute('aria-checked', 'true');
    const box = await button.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(bounds!.x);
    expect(box!.x + box!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
    expect(Math.abs(box!.y - bounds!.y)).toBeLessThanOrEqual(1);
  }
  await expectNoHorizontalOverflow(page);
});

test('種別グループをキーボードで切り替え、履歴移動でも選択を同期する', async ({ page }) => {
  await page.goto('/#/algorithms/f2l');
  const types = page.locator('app-algorithm-kind-links');
  const f2l = types.getByRole('radio', { name: 'F2L 41', exact: true });
  await expect(f2l).toBeChecked();
  await f2l.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/algorithms\/oll$/);
  await expect(types.getByRole('radio', { name: 'OLL 57', exact: true })).toBeChecked();
  await page.goBack();
  await expect(page).toHaveURL(/\/algorithms\/f2l$/);
  await expect(f2l).toBeChecked();
  await expect(types.getByRole('radio', { name: 'OLL 57', exact: true })).not.toBeChecked();
  await page.goForward();
  await expect(page).toHaveURL(/\/algorithms\/oll$/);
  await expect(types.getByRole('radio', { name: 'OLL 57', exact: true })).toBeChecked();
});

test(
  'カード幅に応じてスロット名を切り替え、選択した手順を維持する',
  { tag: '@responsive' },
  async ({ page }) => {
    await page.goto('/#/algorithms/f2l');
    await page.locator('app-algorithm-tools input').fill('01');
    const card = page.locator('app-algorithm-case-card');
    const slots = card.locator('app-slot-button-group');
    await slots.getByRole('radio', { name: 'Back Left', exact: true }).click();
    const setup = await card.locator('.setup').innerText();
    for (const width of [375, 640, 1440, 640, 375]) {
      await page.setViewportSize({ width, height: 900 });
      const compact = width === 640;
      await expect(slots.locator('.short-label:visible')).toHaveCount(compact ? 4 : 0);
      await expect(slots.locator('.full-label:visible')).toHaveCount(compact ? 0 : 4);
      await expect(
        slots.locator(compact ? '.short-label:visible' : '.full-label:visible'),
      ).toHaveText(
        compact
          ? ['FR', 'FL', 'BL', 'BR']
          : ['Front Right', 'Front Left', 'Back Left', 'Back Right'],
      );
      await expect(slots.getByRole('radio', { name: 'Back Left', exact: true })).toBeChecked();
      await expect(card.locator('.setup')).toHaveText(setup);
      await expectElementsWithin(page, 'app-slot-button-group', 'app-slot-button-group button');
      await expectNoHorizontalOverflow(page);
    }
  },
);
