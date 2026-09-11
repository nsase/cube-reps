import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

test(
  '設定で変更した言語が画面遷移と再起動後も反映される',
  { tag: '@responsive' },
  async ({ page }) => {
    await page.goto('/#/timer');
    await page.getByTestId('settings-link').click();
    await expect(page).toHaveURL(/#\/settings$/);
    await expect(page.locator('h1')).toHaveText('SETTINGS');
    await page.getByTestId('language-select').selectOption('ja');
    await expect(page.locator('h1')).toHaveText('設定');
    await expect(page.getByTestId('check-update')).toHaveText('アップデートを確認');
    const settingsLinkBox = await page.getByTestId('settings-link').boundingBox();
    expect(settingsLinkBox).not.toBeNull();
    expect(settingsLinkBox!.y).toBeGreaterThanOrEqual(0);
    expect(settingsLinkBox!.y + settingsLinkBox!.height).toBeLessThanOrEqual(
      page.viewportSize()!.height,
    );
    await expectNoHorizontalOverflow(page);
    await expectResponsiveLayout(page, 'app-language-settings, app-update-settings');
    await page.reload();
    await expect(page.getByTestId('language-select')).toHaveValue('ja');
    await expect(page.locator('h1')).toHaveText('設定');
    await page.getByRole('link', { name: /タイマー/ }).click();
    await expect(page.locator('app-timer')).toBeVisible();
    await page.getByTestId('settings-link').click();
    await page.getByTestId('language-select').selectOption('en');
    await expect(page.locator('h1')).toHaveText('SETTINGS');
    await expectNoHorizontalOverflow(page);
  },
);

test('設定から最新版を確認し、オフラインでの失敗後に再試行できる', async ({ page, context }) => {
  test.setTimeout(60_000);
  await page.goto('/#/settings');
  await page.evaluate(async () => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))))
    await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  const check = page.getByTestId('check-update');
  const status = page.getByTestId('update-status');
  await check.click();
  await expect(status).toHaveText('You are using the latest version.');
  await context.setOffline(true);
  try {
    await check.click();
    await expect(status).toContainText('Could not check for updates.');
  } finally {
    await context.setOffline(false);
  }
  await check.click();
  await expect(status).toHaveText('You are using the latest version.');
});
