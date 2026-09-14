import { expect, test } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';

/** 実際のSWを更新できる配信元。CIのビルド成果物をサブパスで配信する。 */
async function serveVersions(legacy = false) {
  let revision = 1;
  const requests: string[] = [];
  const legacyHtml = await readFile('e2e/fixtures/legacy-app.html', 'utf8');
  const server = createServer(async (request, response) => {
    const path = new URL(request.url!, 'http://localhost').pathname;
    requests.push(path);
    response.setHeader('Cache-Control', 'no-store');
    try {
      if (legacy && revision === 1) {
        if (path.endsWith('ngsw-worker.js')) {
          response.setHeader('Content-Type', 'application/javascript');
          response.end(await readFile('e2e/fixtures/angular-sw/ngsw-worker.js'));
        } else if (path.endsWith('ngsw.json')) {
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({
              configVersion: 1,
              timestamp: 1,
              index: '/cube-reps/index.html',
              assetGroups: [
                {
                  name: 'application',
                  installMode: 'prefetch',
                  updateMode: 'prefetch',
                  urls: ['/cube-reps/index.html'],
                  patterns: [],
                },
              ],
              dataGroups: [],
              hashTable: {
                '/cube-reps/index.html': createHash('sha1').update(legacyHtml).digest('hex'),
              },
              navigationUrls: [{ positive: true, regex: '^/cube-reps/.*$' }],
              navigationRequestStrategy: 'performance',
            }),
          );
        } else {
          response.setHeader('Content-Type', 'text/html');
          response.end(legacyHtml);
        }
        return;
      }
      const relative = path.replace(/^\/cube-reps\//, '') || 'index.html';
      const file = resolve('dist/cube-reps/browser', relative);
      if (!file.startsWith(resolve('dist/cube-reps/browser') + '/'))
        throw new Error('Invalid path');
      const types: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.webmanifest': 'application/manifest+json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.woff2': 'font/woff2',
      };
      response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
      let content = await readFile(file);
      if (relative === 'ngsw.json') {
        const manifest = JSON.parse(content.toString());
        const prefix = (url: string) => `/cube-reps${url}`;
        manifest.index = prefix(manifest.index);
        manifest.navigationUrls = [{ positive: true, regex: '^/cube-reps/$' }];
        manifest.hashTable = Object.fromEntries(
          Object.entries(manifest.hashTable).map(([url, hash]) => [prefix(url), hash]),
        );
        const html = (await readFile(resolve('dist/cube-reps/browser/index.html'), 'utf8')).replace(
          '<base href="/">',
          '<base href="/cube-reps/">',
        );
        manifest.hashTable[manifest.index] = createHash('sha1').update(html).digest('hex');
        for (const group of manifest.assetGroups) group.urls = group.urls.map(prefix);
        content = Buffer.from(JSON.stringify(manifest));
      }
      if (relative === 'index.html')
        content = Buffer.from(
          content.toString().replace('<base href="/">', '<base href="/cube-reps/">'),
        );
      // バイト列の違うSWを配信し、ブラウザ標準の更新ライフサイクルを発生させる。
      if (relative === 'ngsw-worker.js')
        content = Buffer.concat([content, Buffer.from(`\n// revision ${revision}\n`)]);
      response.end(content);
    } catch {
      response.statusCode = 404;
      response.end();
    }
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing server address');
  return {
    url: `http://127.0.0.1:${address.port}/cube-reps/`,
    requests,
    deploy: () => {
      revision++;
    },
    close: () =>
      new Promise<void>((done, reject) =>
        server.close((error) => (error ? reject(error) : done())),
      ),
  };
}

/** インストール済みPWAの表示モードを再現する。 */
async function standalone(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const media = original(query);
      if (query === '(display-mode: standalone)')
        Object.defineProperty(media, 'matches', { value: true });
      return media;
    };
  });
}

test('Workboxでオフライン起動し、復帰後の新版をユーザー操作で適用する', async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  const site = await serveVersions();
  try {
    await standalone(page);
    await page.goto(`${site.url}#/settings`);
    await page.evaluate(async () => navigator.serviceWorker.ready);
    await page.reload();
    await expect(page.getByTestId('check-update')).toBeVisible();
    await page.getByTestId('check-update').click();
    await expect(page.getByTestId('update-status')).toHaveText('You are using the latest version.');
    const updateRequests: string[] = [];
    const workerRequests: string[] = [];
    context.on('request', (request) => {
      if (request.serviceWorker()) workerRequests.push(request.url());
      if (/ngsw\.json|ngsw-worker\.js/.test(request.url())) updateRequests.push(request.url());
    });
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId('check-update')).toBeVisible();
    await page.getByTestId('check-update').click();
    await expect(page.getByTestId('update-status')).toContainText('Could not check for updates.');
    expect(workerRequests).toEqual([]);
    expect(updateRequests.filter((url) => url.includes('ngsw.json'))).toEqual([]);
    // ブラウザ自身のSW更新確認とは区別し、SW内から資産取得が始まらないことも確認する。
    expect(site.requests.filter((url) => url.endsWith('ngsw.json'))).toEqual([]);
    site.deploy();
    await context.setOffline(false);
    await expect(page.getByTestId('apply-update')).toBeVisible();
    await expect(page.locator('app-update-snackbar')).toBeVisible();
    await page.getByTestId('apply-update').click();
    await expect(page.getByTestId('apply-update')).toHaveCount(0);
    await expect(page.locator('app-update-snackbar')).toHaveCount(0);
    await page.getByTestId('check-update').click();
    await expect(page.getByTestId('update-status')).toHaveText('You are using the latest version.');
  } finally {
    await context.setOffline(false);
    await page.close();
    await site.close();
  }
});

test('既存Angular SWをWorkboxへ移行し、保存データを保持してオフライン起動する', async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  const site = await serveVersions(true);
  try {
    await standalone(page);
    await page.goto(site.url);
    await page.evaluate(async () => {
      localStorage.setItem('cube-reps.language', 'ja');
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('migration-records', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('records');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction('records', 'readwrite');
          transaction.objectStore('records').put({ time: 1234 }, 'solve');
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        };
      });
      await navigator.serviceWorker.register('./ngsw-worker.js');
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect(page.locator('h1')).toHaveText('Legacy CubeReps');
    const legacyWindow = await context.newPage();
    await legacyWindow.goto(site.url);
    await expect(legacyWindow.locator('h1')).toHaveText('Legacy CubeReps');
    site.deploy();
    await page.getByRole('button', { name: 'Check for updates', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Update now', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    });
    await expect
      .poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting)))
      .toBe(true);
    // 旧Angularの適用操作と、その直後のオフライン再読み込みを検証する。
    await context.setOffline(true);
    await page.getByRole('button', { name: 'Update now', exact: true }).click();
    await expect(page.locator('app-timer')).toBeVisible();
    await page.getByTestId('settings-link').click();
    await expect(page.getByTestId('language-select')).toHaveValue('ja');
    // 旧版の画面を閉じなくても、Workboxへの切り替えを設定から完了できる。
    await expect(page.getByTestId('apply-update')).toBeVisible();
    await page.getByTestId('apply-update').click();
    await expect(page.getByTestId('apply-update')).toHaveCount(0);
    await expect(page.getByTestId('language-select')).toHaveValue('ja');
    // 他のウィンドウに残った旧Angular画面からの適用にも応答する。
    await legacyWindow.getByRole('button', { name: 'Check for updates', exact: true }).click();
    await expect(
      legacyWindow.getByRole('button', { name: 'Update now', exact: true }),
    ).toBeVisible();
    await legacyWindow.getByRole('button', { name: 'Update now', exact: true }).click();
    await expect(legacyWindow.locator('app-timer')).toBeVisible();
    await legacyWindow.close();
    const migrated = page;
    expect(
      await migrated.evaluate(
        () =>
          new Promise((resolve, reject) => {
            const request = indexedDB.open('migration-records', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const database = request.result;
              const read = database.transaction('records').objectStore('records').get('solve');
              read.onsuccess = () => {
                database.close();
                resolve(read.result);
              };
              read.onerror = () => reject(read.error);
            };
          }),
      ),
    ).toEqual({ time: 1234 });
    await migrated.close();
  } finally {
    await context.setOffline(false);
    await page.close();
    await site.close();
  }
});

test('Web版ではSWが新版を取得しても更新操作・通知を表示しない', async ({ page }) => {
  const site = await serveVersions();
  try {
    await page.goto(`${site.url}#/settings`);
    await page.evaluate(async () => navigator.serviceWorker.ready);
    await page.reload();
    site.deploy();
    await page.evaluate(async () => (await navigator.serviceWorker.ready).update());
    await expect
      .poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting)))
      .toBe(true);
    await expect(page.locator('app-update-settings')).toContainText(
      'Update checking is not available in this environment.',
    );
    await expect(page.getByTestId('check-update')).toHaveCount(0);
    await expect(page.getByTestId('apply-update')).toHaveCount(0);
    await expect(page.locator('app-update-snackbar')).toHaveCount(0);
  } finally {
    await page.close();
    await site.close();
  }
});

test('別ウィンドウで更新済みでも残った通知から新版へ切り替えられる', async ({ page, context }) => {
  const site = await serveVersions();
  const other = await context.newPage();
  try {
    await standalone(page);
    await standalone(other);
    await page.goto(`${site.url}#/settings`);
    await page.evaluate(async () => navigator.serviceWorker.ready);
    await page.reload();
    await other.goto(`${site.url}#/settings`);
    site.deploy();
    await page.getByTestId('check-update').click();
    await expect(page.getByTestId('apply-update')).toBeVisible();
    await expect(other.getByTestId('apply-update')).toBeVisible();
    await page.getByTestId('apply-update').click();
    await expect(page.getByTestId('apply-update')).toHaveCount(0);
    await other.getByTestId('apply-update').click();
    await expect(other.getByTestId('apply-update')).toHaveCount(0);
    await expect(other.getByTestId('check-update')).toBeVisible();
    await expect(other.locator('app-update-settings [role="alert"]')).toHaveCount(0);
  } finally {
    await page.close();
    await other.close();
    await site.close();
  }
});
