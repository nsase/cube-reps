import { version } from '../package.json';
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
    await expect(page.getByTestId('app-version')).toHaveText(`Version: ${version}`);
    await page.getByTestId('language-select').selectOption('ja');
    await expect(page.locator('h1')).toHaveText('設定');
    await expect(page.getByTestId('app-version')).toHaveText(`バージョン: ${version}`);
    await expect(page.locator('app-update-settings')).toContainText(
      'この環境ではアプリの更新確認を利用できません。',
    );
    await expect(page.getByTestId('check-update')).toHaveCount(0);
    const settingsLinkBox = await page.getByTestId('settings-link').boundingBox();
    expect(settingsLinkBox).not.toBeNull();
    expect(settingsLinkBox!.y).toBeGreaterThanOrEqual(0);
    if (page.viewportSize()!.width > 620) {
      const sidebar = await page.locator('aside').boundingBox();
      expect(settingsLinkBox!.y).toBeGreaterThan(sidebar!.height / 2);
      expect(
        sidebar!.y + sidebar!.height - settingsLinkBox!.y - settingsLinkBox!.height,
      ).toBeLessThanOrEqual(35);
    }
    expect(settingsLinkBox!.y + settingsLinkBox!.height).toBeLessThanOrEqual(
      page.viewportSize()!.height,
    );
    await expectNoHorizontalOverflow(page);
    await expectResponsiveLayout(
      page,
      'app-language-settings, app-update-settings, app-website-links',
    );
    await page.reload();
    await expect(page.getByTestId('language-select')).toHaveValue('ja');
    await expect(page.locator('h1')).toHaveText('設定');
    await expect(page.getByTestId('app-version')).toHaveText(`バージョン: ${version}`);
    await page.getByRole('link', { name: /タイマー/ }).click();
    await expect(page.locator('app-timer')).toBeVisible();
    await page.getByTestId('settings-link').click();
    await page.getByTestId('language-select').selectOption('en');
    await expect(page.locator('h1')).toHaveText('SETTINGS');
    await expect(page.getByTestId('app-version')).toHaveText(`Version: ${version}`);
    await expectNoHorizontalOverflow(page);
  },
);

test('設定から最新版を確認し、オフラインでの失敗後に再試行できる', async ({ page, context }) => {
  test.setTimeout(60_000);
  // インストール済みPWAの表示モードを再現する。
  await page.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const result = matchMedia(query);
      if (query === '(display-mode: standalone)')
        Object.defineProperty(result, 'matches', { value: true });
      return result;
    };
  });
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

test('Web版では新版を取得しても更新通知や設定の更新操作を表示しない', async ({ page }) => {
  await page.goto('/#/settings');
  await expect(page.locator('app-update-settings')).toContainText(
    'Update checking is not available in this environment.',
  );
  await page.evaluate(() => {
    navigator.serviceWorker.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'VERSION_READY',
          currentVersion: { hash: 'current' },
          latestVersion: { hash: 'next' },
        },
      }),
    );
  });
  await expect(page.getByTestId('check-update')).toHaveCount(0);
  await expect(page.getByTestId('apply-update')).toHaveCount(0);
  await expect(page.locator('app-update-snackbar')).toHaveCount(0);
  await page.getByRole('link', { name: 'Timer', exact: true }).click();
  await expect(page.locator('app-timer')).toBeVisible();
  await expect(page.locator('app-update-snackbar')).toHaveCount(0);
});

test('設定の関連リンクからWeb版とGitHubを別タブで開く', async ({ page, context }) => {
  // 外部サイトの稼働状況に依存せず、実際のリンク操作と遷移先を確認する。
  for (const url of ['https://nsase.github.io/cube-reps/', 'https://github.com/nsase/cube-reps']) {
    await context.route(url, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<h1>Linked website</h1>' }),
    );
  }
  await page.goto('/#/settings');
  for (const [name, url] of [
    ['Open web version', 'https://nsase.github.io/cube-reps/'],
    ['GitHub', 'https://github.com/nsase/cube-reps'],
  ]) {
    const opened = context.waitForEvent('page');
    await page.getByRole('link', { name, exact: true }).click();
    const destination = await opened;
    await expect(destination).toHaveURL(url);
    await expect(destination.getByRole('heading')).toHaveText('Linked website');
    await destination.close();
    await expect(page).toHaveURL(/#\/settings$/);
  }
});

// 表示分岐と操作フローだけを検証する。Android実機でのネイティブAPI検証は別途必要。
test('Android用の設定でストア更新を案内し、ゲストとしてタイマーへ進める', async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { CapacitorCustomPlatform: { name: 'android' } });
  });
  await page.goto('/#/settings');
  await expect(page.locator('app-update-settings')).toContainText(
    'Install a newer version from the app store or your app distributor.',
  );
  await expect(page.getByTestId('check-update')).toHaveCount(0);
  await page.getByTestId('language-select').selectOption('ja');
  await expect(page.locator('app-update-settings')).toContainText(
    'ストアまたは配布元から新しいバージョンをインストールしてください。',
  );
  await page.goto('/#/login');
  await expect(page.getByTestId('google-sign-in')).toHaveCount(0);
  await expect(page.locator('app-google-button')).toContainText(
    'このアプリではゲストとして利用できます。',
  );
  await page.getByRole('link', { name: 'ログインしないで利用する' }).click();
  await expect(page.locator('app-timer')).toBeVisible();
});
