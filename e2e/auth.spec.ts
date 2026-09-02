import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow } from './support/layout';

test.describe('任意のGoogleログイン', { tag: '@responsive' }, () => {
  test('未ログインでもTimerを利用でき、認証操作が画面内に収まる', async ({ page }) => {
    await page.goto('/#/timer');

    await expect(page.locator('app-timer')).toBeVisible();
    await expect(page.getByTestId('google-sign-in')).toBeVisible();
    await expect(page.getByTestId('solve-migration')).toHaveCount(0);
    await expect(page.getByTestId('timer-scramble-refresh')).toBeEnabled({ timeout: 15_000 });
    await expectNoHorizontalOverflow(page);

    const clock = page.locator('app-timer-clock .clock');
    await page.keyboard.down('Space');
    await expect(clock).toHaveClass(/\bready\b/);
    await page.keyboard.up('Space');
    await expect(clock.locator('strong')).not.toHaveText('0.00');
    await page.keyboard.press('Space');
    await expect(page.locator('.today strong')).toHaveText('1');

    await page.reload();
    await expect(page.locator('.today strong')).toHaveText('1');
    await expect(page.getByTestId('solve-migration')).toHaveCount(0);
  });
});
