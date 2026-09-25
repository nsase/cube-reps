import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** タイマー画面で独立して配置される主要コンポーネント。 */
const layoutItems = 'app-timer-settings, app-timer-clock, app-timer-scramble, app-timer-stats';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/timer');
  await expect(page.locator('app-timer')).toBeVisible();
});

test.describe('レスポンシブ表示', { tag: '@responsive' }, () => {
  test('拡大した文字でもレスポンシブ配置が画面内に収まる', async ({ page }) => {
    await expect(page.locator('body')).toHaveCSS('font-size', '16px');
    await expect(page.locator('app-timer-scramble p')).toHaveCSS('font-size', '19.2px');
    await expectNoHorizontalOverflow(page);
    await expectResponsiveLayout(page, layoutItems);
  });

  test('内容が収まる高さでは不要な縦スクロールが発生しない', async ({ page }) => {
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    if (viewportHeight >= 600) {
      expect(pageHeight).toBeLessThanOrEqual(viewportHeight);
      return;
    }

    expect(pageHeight).toBeGreaterThan(viewportHeight);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test('時計文字が割り当て領域へ収まる', async ({ page }) => {
    const clock = page.locator('app-timer-clock');
    const time = clock.locator('strong');

    await expect(time).toHaveText('0.00');

    const [clockBox, timeBox] = await Promise.all([clock.boundingBox(), time.boundingBox()]);
    expect(clockBox).not.toBeNull();
    expect(timeBox).not.toBeNull();
    expect(timeBox!.width).toBeLessThanOrEqual(clockBox!.width);
    expect(timeBox!.height).toBeLessThanOrEqual(clockBox!.height);
  });
});

test(
  'OLL・PLL Drillではランダムをケース選択肢の先頭に表示する',
  { tag: '@responsive' },
  async ({ page }) => {
    await page.getByRole('radio', { name: /OLL/ }).click();
    const caseSelect = page.getByTestId('timer-drill-case-filter');

    await expect(caseSelect.locator('option')).toHaveCount(58);
    await expect(caseSelect.locator('option').first()).toHaveText(/ランダム|Random/);
    await expect(caseSelect.locator('option:checked')).toHaveText(/ランダム|Random/);
    await expect(page.getByTestId('timer-scramble-refresh')).toBeVisible();

    await caseSelect.selectOption({ index: 1 });
    await expect(page.locator('app-timer-scramble p')).toHaveText("F R' F' R U2 F R' F' R2 U2 R'");

    await expect(page.getByTestId('timer-scramble-refresh')).toBeHidden();

    await page.getByRole('radio', { name: /PLL/ }).click();

    await expect(caseSelect.locator('option')).toHaveCount(22);
    await expectResponsiveLayout(page, 'app-timer-settings .modes button');
    await expectNoHorizontalOverflow(page);
    await expect(caseSelect.locator('option:checked')).toHaveText(/ランダム|Random/);
    await expect(page.getByTestId('timer-scramble-refresh')).toBeVisible();
    await page.getByRole('radio', { name: /3×3/ }).click();
    await expect(caseSelect).toBeHidden();
  },
);

test('スクランブル再作成後のSpace操作でタイマーを開始する', async ({ page }) => {
  const refreshButton = page.getByTestId('timer-scramble-refresh');
  const clock = page.locator('app-timer-clock .clock');
  const time = clock.locator('strong');
  await expect(refreshButton).toBeEnabled({ timeout: 15_000 });

  await refreshButton.focus();
  await refreshButton.press('Enter');
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(refreshButton).toBeEnabled();
  await expect(refreshButton).not.toBeFocused();

  await page.keyboard.down('Space');
  await expect(clock).toHaveClass(/\bready\b/);
  await page.keyboard.up('Space');

  await expect(time).not.toHaveText('0.00');
});

test(
  'F2Lのケース・スロットを選んで1ペアを計測し、保存・再読込・再計測できる',
  { tag: '@responsive' },
  async ({ page }) => {
    await page.getByRole('radio', { name: /F2L/ }).click();
    const cases = page.getByTestId('timer-drill-case-filter');
    const slots = page.getByTestId('timer-f2l-slot');
    await expect(cases.locator('option')).toHaveCount(42);
    await expect(cases.locator('option:checked')).toHaveText('Random');
    await expect(slots).toHaveValue('random');
    await cases.selectOption({ label: '01' });
    await expect(page.getByTestId('timer-scramble-refresh')).toBeVisible();
    await page.getByTestId('timer-scramble-refresh').click();
    await expect(cases.locator('option:checked')).toHaveText('01');
    await slots.selectOption('FR');
    await expect(page.getByTestId('timer-scramble-refresh')).toBeHidden();
    const scramble = page.locator('app-timer-scramble p');
    await expect(scramble).toHaveText("R U R' U'");
    for (const [slot, rotation] of [
      ['FL', ' y'],
      ['BR', " y'"],
      ['FR', ''],
      ['BL', ' y2'],
    ]) {
      await slots.selectOption(slot);
      await expect(scramble).toHaveText("R U R' U'" + rotation);
    }
    await expect(page.locator('app-timer-scramble app-cube-quarter-view')).toBeVisible();
    await expectResponsiveLayout(page, layoutItems);
    await expectResponsiveLayout(page, 'app-timer-settings .modes button');
    await expectNoHorizontalOverflow(page);
    await slots.evaluate((element) => (element as HTMLSelectElement).blur());
    const clock = page.locator('app-timer-clock .clock');
    await page.keyboard.down('Space');
    await expect(clock).toHaveClass(/ready/);
    await page.keyboard.up('Space');
    await expect(page.locator('app-timer-settings')).toBeHidden();
    await expect(page.locator('app-timer-scramble')).toBeHidden();
    await expect(page.locator('app-timer-stats')).toBeHidden();
    await expect(clock.locator('strong')).not.toHaveText('0.00');
    await page.keyboard.press('Space');
    await expect(page.locator('app-timer-solve-actions')).toBeVisible();
    await page.getByRole('link', { name: 'History', exact: true }).click();
    const category = page.getByLabel('Solve category', { exact: true });
    await category.selectOption('f2l');
    await expect(page.locator('app-solve-record')).toHaveCount(1);
    await page.reload();
    await page.getByLabel('Solve category', { exact: true }).selectOption('f2l');
    await expect(page.locator('app-solve-record')).toHaveCount(1);
    await page.getByRole('button', { name: 'View solve details', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('F2L · 01');
    await expect(dialog).toContainText('Back Left');
    await expect(dialog.locator('app-cube-quarter-view')).toBeVisible();
    await dialog
      .getByRole('button', { name: 'Retry', exact: true })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(/\/timer$/);
    await expect(page.getByRole('radio', { name: /F2L/ })).toBeChecked();
    await expect(slots).toHaveValue('BL');
    await expect(cases.locator('option:checked')).toHaveText('01');
    await expect(scramble).toHaveText("R U R' U' y2");
  },
);
