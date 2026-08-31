import { expect, test } from '@playwright/test';

test('生成したカスタムテーマをMaterialコンポーネントへ適用する', async ({ page }) => {
  await page.goto('/#/timer');

  const theme = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue('--mat-sys-primary').trim(),
      onPrimary: styles.getPropertyValue('--mat-sys-on-primary').trim(),
      surface: styles.getPropertyValue('--mat-sys-surface').trim(),
      onSurface: styles.getPropertyValue('--mat-sys-on-surface').trim(),
      inversePrimary: styles.getPropertyValue('--mat-sys-inverse-primary').trim(),
      inverseSurface: styles.getPropertyValue('--mat-sys-inverse-surface').trim(),
      inverseOnSurface: styles.getPropertyValue('--mat-sys-inverse-on-surface').trim(),
      snackBarText: styles.getPropertyValue('--mat-snack-bar-supporting-text-color').trim(),
    };
  });

  expect(theme).toEqual({
    primary: 'light-dark(#006e16, #68df65)',
    onPrimary: 'light-dark(#ffffff, #003907)',
    surface: 'light-dark(#f4fced, #0f150d)',
    onSurface: 'light-dark(#171d15, #dde5d7)',
    inversePrimary: 'light-dark(#68df65, #006e16)',
    inverseSurface: 'light-dark(#2b3229, #dde5d7)',
    inverseOnSurface: 'light-dark(#ecf3e5, #2b3229)',
    snackBarText: '#ffffff',
  });
});
