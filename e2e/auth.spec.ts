import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow } from './support/layout';

test.describe('任意のGoogleログイン', { tag: '@responsive' }, () => {
  test('未ログインでもTimerを利用でき、認証操作が画面内に収まる', async ({ page }) => {
    await page.goto('/#/timer');

    await expect(page.locator('app-timer')).toBeVisible();
    await expect(page.getByTestId('profile-menu-trigger')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('sync-status')).toContainText('Local only', { timeout: 15_000 });
    await expect(page.getByTestId('solve-migration')).toHaveCount(0);
    await expect(page.getByTestId('timer-scramble-refresh')).toBeEnabled({ timeout: 15_000 });
    await expectNoHorizontalOverflow(page);

    const clock = page.locator('app-timer-clock .clock');
    await page.keyboard.down('Space');
    await expect(clock).toHaveClass(/\bready\b/);
    await page.keyboard.up('Space');
    await expect(clock.locator('strong')).not.toHaveText('0.00');
    await page.keyboard.press('Space');
    await page.getByRole('link', { name: 'History', exact: true }).click();
    await expect(page.locator('app-solve-record')).toHaveCount(1);

    await page.reload();
    await expect(page.locator('app-solve-record')).toHaveCount(1);
    await expect(page.getByTestId('solve-migration')).toHaveCount(0);
  });
});

test(
  'プロフィールからログインページへ移動し、ゲストのまま戻れる',
  { tag: '@responsive' },
  async ({ page }) => {
    await page.goto('/#/timer');
    const profile = page.getByTestId('profile-menu-trigger');
    await profile.click();
    await expect(page.getByTestId('profile-information')).toContainText('Guest account', {
      timeout: 15_000,
    });
    await expectNoHorizontalOverflow(page);
    const menuBox = await page.getByRole('menu').boundingBox();
    expect(menuBox!.x).toBeGreaterThanOrEqual(0);
    expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.getByTestId('open-login').click();
    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByTestId('google-sign-in')).toBeVisible();
    await page.getByTestId('settings-link').click();
    await page.getByTestId('language-select').selectOption('ja');
    await page.goto('/#/login');
    await expect(page.getByTestId('google-sign-in')).toContainText('Sign in with Google');
    await expect(page.locator('h1')).toHaveText('ログイン');
    await expectNoHorizontalOverflow(page);
    await page.reload();
    await expect(page.getByTestId('google-sign-in')).toBeVisible();
    await page.getByRole('link', { name: 'ログインしないで利用する' }).click();
    await expect(page.locator('app-timer')).toBeVisible();
    await profile.click();
    await expect(page.getByTestId('profile-information')).toContainText('ゲストアカウント');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
  },
);
