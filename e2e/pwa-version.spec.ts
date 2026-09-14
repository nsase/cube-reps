import { expect, test } from '@playwright/test';
import { version } from '../package.json';
import { createVersionServer } from './support/version-server';

test('PWA更新を適用すると表示番号が新版へ切り替わりオフライン再起動後も維持される', async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(240_000);
  const nextVersion = `${version}-e2e-next`;
  const server = await createVersionServer(nextVersion);
  try {
    await testInfo.attach('next-version-build.log', {
      body: server.buildLog,
      contentType: 'text/plain',
    });
    // 表示モードだけを再現し、SW登録・取得・適用・再読み込みは実際の処理を通す。
    await page.addInitScript(() => {
      const matchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => {
        const result = matchMedia(query);
        if (query === '(display-mode: standalone)')
          Object.defineProperty(result, 'matches', { value: true });
        return result;
      };
    });
    await page.goto(`${server.url}/#/settings`);
    const displayedVersion = page.getByTestId('app-version');
    await expect(displayedVersion).toHaveText(`Version: ${version}`);
    await page.evaluate(async () => navigator.serviceWorker.ready);
    if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))))
      await page.reload();
    await expect
      .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
      .toBe(true);
    await expect(displayedVersion).toHaveText(`Version: ${version}`);

    server.publishUpdate();
    await page.getByTestId('check-update').click();
    await expect(page.getByTestId('apply-update')).toBeEnabled({ timeout: 30_000 });
    await expect(displayedVersion).toHaveText(`Version: ${version}`);
    await page.getByTestId('apply-update').click();
    await expect(displayedVersion).toHaveText(`Version: ${nextVersion}`, { timeout: 30_000 });
    await expect(page.getByTestId('apply-update')).toHaveCount(0);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(displayedVersion).toHaveText(`Version: ${nextVersion}`);
    await page.getByTestId('language-select').selectOption('ja');
    await expect(displayedVersion).toHaveText(`バージョン: ${nextVersion}`);
  } finally {
    try {
      await context.setOffline(false);
      await page.goto('about:blank');
    } finally {
      await server.close();
    }
  }
});
