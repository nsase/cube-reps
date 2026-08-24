import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** タイマー画面で独立して配置される主要コンポーネント。 */
const layoutItems = 'app-timer-settings, app-timer-clock, app-timer-scramble, app-timer-stats';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/timer');
  await expect(page.locator('app-timer')).toBeVisible();
});

test('レスポンシブ配置が画面内に収まる', async ({ page }) => {
  await expectNoHorizontalOverflow(page);
  await expectResponsiveLayout(page, layoutItems);
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

test('スクランブル再作成後にボタンからフォーカスを外す', async ({ page }) => {
  const refreshButton = page.getByRole('button', { name: /スクランブルを更新|Refresh scramble/ });
  await expect(refreshButton).toBeEnabled();

  await refreshButton.focus();
  await refreshButton.press('Enter');

  await expect(refreshButton).not.toBeFocused();
});
