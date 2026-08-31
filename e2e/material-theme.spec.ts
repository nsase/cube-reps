import { expect, test } from '@playwright/test';

test('MaterialコンポーネントへCubeReps共通テーマを適用する', async ({ page }) => {
  await page.goto('/#/timer');

  const theme = await page.evaluate(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const updateContainer = document.createElement('div');
    updateContainer.className = 'app-update-snackbar-container';
    document.body.append(updateContainer);
    const updateStyles = getComputedStyle(updateContainer);

    const values = {
      primary: rootStyles.getPropertyValue('--mat-sys-primary').trim(),
      onPrimary: rootStyles.getPropertyValue('--mat-sys-on-primary').trim(),
      surface: rootStyles.getPropertyValue('--mat-sys-surface').trim(),
      onSurface: rootStyles.getPropertyValue('--mat-sys-on-surface').trim(),
      filledButton: rootStyles.getPropertyValue('--mat-button-filled-container-color').trim(),
      filledButtonLabel: rootStyles.getPropertyValue('--mat-button-filled-label-text-color').trim(),
      snackBar: rootStyles.getPropertyValue('--mat-snack-bar-container-color').trim(),
      snackBarText: rootStyles.getPropertyValue('--mat-snack-bar-supporting-text-color').trim(),
      snackBarAction: rootStyles.getPropertyValue('--mat-snack-bar-button-color').trim(),
      updateCloseIcon: updateStyles.getPropertyValue('--mat-icon-button-icon-color').trim(),
    };
    updateContainer.remove();
    return values;
  });

  expect(theme).toEqual({
    primary: '#c9ef46',
    onPrimary: '#181a17',
    surface: '#ffffff',
    onSurface: '#181a17',
    filledButton: '#181a17',
    filledButtonLabel: '#c9ef46',
    snackBar: '#181a17',
    snackBarText: '#ffffff',
    snackBarAction: '#c9ef46',
    updateCloseIcon: '#c9ef46',
  });
});
