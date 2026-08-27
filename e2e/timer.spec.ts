import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** タイマー画面で独立して配置される主要コンポーネント。 */
const layoutItems = 'app-timer-settings, app-timer-clock, app-timer-scramble, app-timer-stats';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/timer');
  await expect(page.locator('app-timer')).toBeVisible();
});

test.describe('レスポンシブ表示', { tag: '@responsive' }, () => {
  test('レスポンシブ配置が画面内に収まる', async ({ page }) => {
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

test('OLL・PLL Drillではランダムをケース選択肢の先頭に表示する', async ({ page }) => {
  await page.getByRole('button', { name: /OLL/ }).click();
  const caseSelect = page.getByTestId('timer-drill-case-filter');

  await expect(caseSelect.locator('option')).toHaveCount(58);
  await expect(caseSelect.locator('option').first()).toHaveText(/ランダム|Random/);
  await expect(caseSelect.locator('option:checked')).toHaveText(/ランダム|Random/);
  await expect(page.getByTestId('timer-scramble-refresh')).toBeVisible();

  await caseSelect.selectOption({ index: 1 });
  await expect(page.locator('app-timer-scramble p')).toHaveText("F R' F' R U2 F R' F' R2 U2 R'");

  await expect(page.getByTestId('timer-scramble-refresh')).toBeHidden();

  await page.getByRole('button', { name: /PLL/ }).click();

  await expect(caseSelect.locator('option')).toHaveCount(22);
  await expect(caseSelect.locator('option:checked')).toHaveText(/ランダム|Random/);
  await expect(page.getByTestId('timer-scramble-refresh')).toBeVisible();
});

test('スクランブル再作成後のSpace操作でタイマーを開始する', async ({ page }) => {
  const refreshButton = page.getByTestId('timer-scramble-refresh');
  const clock = page.locator('app-timer-clock .clock');
  const time = clock.locator('strong');
  await expect(refreshButton).toBeEnabled();

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
