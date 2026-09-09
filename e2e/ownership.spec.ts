import { expect, Page, test } from '@playwright/test';
import { expectNoHorizontalOverflow } from './support/layout';

// 認証・クラウド通信のスタブをService Workerの外側で確実に適用する。
test.use({ serviceWorkers: 'block' });

/** Firebaseの認証通信をテスト内に閉じ、永続セッションからの通常の復元を利用する。 */
async function seedSession(page: Page): Promise<void> {
  await page.route('https://identitytoolkit.googleapis.com/**', (route) =>
    route.fulfill({
      json: {
        users: [
          {
            localId: 'target',
            displayName: 'Target User',
            email: 'target@example.test',
            emailVerified: true,
            providerUserInfo: [
              {
                providerId: 'google.com',
                rawId: 'target',
                displayName: 'Target User',
                email: 'target@example.test',
              },
            ],
          },
        ],
      },
    }),
  );
  await page.route('https://securetoken.googleapis.com/**', (route) => route.abort());
  await page.route('https://firestore.googleapis.com/**', (route) => route.abort());
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('firebaseLocalStorageDb', 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('firebaseLocalStorage', { keyPath: 'fbase_key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const token = [
      btoa(JSON.stringify({ alg: 'none' })),
      btoa(
        JSON.stringify({
          sub: 'target',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'cube-reps',
          iss: 'https://securetoken.google.com/cube-reps',
        }),
      ),
      'test',
    ].join('.');
    const transaction = database.transaction('firebaseLocalStorage', 'readwrite');
    transaction.objectStore('firebaseLocalStorage').put({
      fbase_key: 'firebase:authUser:AIzaSyB2FFzSFec1r3xWr6fifvL0R-IoiQ8zhlg:[DEFAULT]',
      value: {
        uid: 'target',
        email: 'target@example.test',
        emailVerified: true,
        displayName: 'Target User',
        isAnonymous: false,
        providerData: [
          {
            providerId: 'google.com',
            uid: 'target',
            displayName: 'Target User',
            email: 'target@example.test',
            photoURL: null,
          },
        ],
        stsTokenManager: {
          refreshToken: 'test',
          accessToken: token,
          expirationTime: Date.now() + 3600000,
        },
        apiKey: 'AIzaSyB2FFzSFec1r3xWr6fifvL0R-IoiQ8zhlg',
        appName: '[DEFAULT]',
      },
    });
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
}

/** 旧ゲスト所有者が異なる記録とアカウント台帳を保存する。 */
async function seedHistory(page: Page): Promise<void> {
  await page.goto('/#/history');
  await expect(page.locator('app-history')).toBeVisible();
  await page.evaluate(async () => {
    const request = indexedDB.open('cube-reps');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction(['solves', 'accounts'], 'readwrite');
    for (const [index, owner] of ['guest-one', 'guest-two', 'other'].entries()) {
      transaction.objectStore('solves').put({
        id: `record-${index}`,
        time: (index + 1) * 1000,
        scramble: 'R U',
        createdAt: new Date(2026, 0, index + 1).toISOString(),
        updatedAt: new Date(2026, 0, index + 1).toISOString(),
        ownerType: index === 2 ? 'account' : 'guest',
        ...(index === 2 ? { ownerId: owner } : {}),
        category: 'full',
        penalty: 'none',
        groupId: 'unclassified',
        schemaVersion: 2,
      });
    }
    transaction.objectStore('accounts').put({
      uid: 'other',
      displayName: 'Other User',
      email: 'other@example.test',
      providerIds: ['apple.com'],
    });
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
}

test(
  '所有者で一覧・集計を絞り込み、所有者のツールチップと記録詳細を確認する',
  { tag: '@responsive' },
  async ({ page, isMobile }) => {
    await seedHistory(page);
    await page.reload();
    await expect(page.locator('app-solve-record')).toHaveCount(3);
    // 選択欄と所有者を行の前方に保ち、補助情報も各端末で欠けないことを確認する。
    const row = page.locator('app-solve-record').first();
    const checkbox = row.getByRole('checkbox');
    await expect(checkbox).toBeDisabled();
    const boxes = await row.evaluate((element) =>
      [...element.children].map((child) => {
        const rect = child.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }),
    );
    expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left + 1);
    const avatar = (await row.locator('app-owner-avatar [role="img"]').boundingBox())!;
    expect(avatar.x + avatar.width).toBeLessThanOrEqual(boxes[3].left + 1);
    const rowBox = (await row.boundingBox())!;
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(rowBox.x);
      expect(box.right).toBeLessThanOrEqual(rowBox.x + rowBox.width);
    }
    await page.getByTestId('history-owner-filter').selectOption('account:other');
    await expect(page.locator('app-solve-record')).toHaveCount(1);
    await expect(page.locator('app-history-summary')).toContainText('3.00');
    const owner = page.locator('app-owner-avatar [role="img"]');
    if (!isMobile) {
      await owner.hover();
      const tooltip = page.locator('mat-tooltip-component');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('apple.com');
    }
    await owner.click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'View solve details', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('apple.com');
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(
      page.locator('app-solve-record app-solve-actions button').filter({ hasText: '+2' }),
    ).toBeDisabled();
    await page.getByTestId('history-owner-filter').selectOption('unlinked');
    await expect(page.locator('app-solve-record')).toHaveCount(2);
    await page.getByTestId('history-owner-filter').selectOption('all');
    await expect(page.locator('app-solve-record')).toHaveCount(3);
    await expectNoHorizontalOverflow(page);
  },
);

test(
  '選択移行とコピーを確認し、ログアウト・再読み込み後も全記録が残る',
  { tag: '@responsive' },
  async ({ page }) => {
    await seedHistory(page);
    await seedSession(page);
    await page.reload();
    await page.getByTestId('profile-menu-trigger').click();
    await expect(page.getByTestId('authenticated-account')).toContainText('Target User', {
      timeout: 15000,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator('app-solve-record')).toHaveCount(3);
    await page.getByTestId('history-owner-filter').selectOption('unlinked');
    await page.locator('app-solve-record').first().getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Move to current account', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('Target User');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.locator('app-solve-record')).toHaveCount(2);
    await page.getByRole('button', { name: 'Move to current account', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Move to current account' }).click();
    await expect(page.locator('app-solve-record')).toHaveCount(1);
    await page.getByTestId('history-owner-filter').selectOption('account:other');
    await page.locator('app-solve-record').getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Copy to current account', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Copy to current account' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.locator('app-solve-record').getByRole('checkbox')).not.toBeChecked();
    await page.getByTestId('history-owner-filter').selectOption('all');
    await expect(page.locator('app-solve-record')).toHaveCount(4);
    await expectNoHorizontalOverflow(page);
    await page.getByTestId('profile-menu-trigger').click();
    await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click();
    await page.getByTestId('profile-menu-trigger').click();
    await expect(page.getByTestId('profile-information')).toContainText('Guest account');
    await page.keyboard.press('Escape');
    await expect(page.locator('app-solve-record')).toHaveCount(4);
    await page.reload();
    await expect(page.locator('app-solve-record')).toHaveCount(4);
    await page.locator('nav a[href="#/timer"]').click();
    await expect(page.locator('app-timer')).toBeVisible();
  },
);

/** グループの所有者変更を、実際の移行操作と再読み込みで確認する。 */
test(
  'ゲスト記録の移行で同じグループのアバターがアカウントへ切り替わる',
  { tag: '@responsive' },
  async ({ page }) => {
    await seedHistory(page);
    await page.evaluate(async () => {
      const request = indexedDB.open('cube-reps');
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const transaction = database.transaction(['groups', 'solves'], 'readwrite');
      transaction.objectStore('groups').put({
        id: 'practice',
        name: 'Practice',
        ownerType: 'guest',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        schemaVersion: 3,
      });
      const records = transaction.objectStore('solves');
      const record = records.get('record-0');
      record.onsuccess = () => records.put({ ...record.result, groupId: 'practice' });
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      database.close();
    });
    await seedSession(page);
    await page.reload();
    await page.getByTestId('profile-menu-trigger').click();
    await expect(page.getByTestId('authenticated-account')).toContainText('Target User', {
      timeout: 15000,
    });
    await page.keyboard.press('Escape');
    const group = page.locator('app-record-group').filter({ hasText: 'Practice' });
    await expect(group).toHaveCount(1);
    await expect(group.getByRole('img')).toHaveAccessibleName('Not linked to an account');
    await group.getByRole('button').filter({ hasText: 'Practice' }).click();
    await page.locator('app-solve-record').getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Move to current account', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Move to current account' }).click();
    await expect(group.getByRole('img')).toHaveAccessibleName(/Target User/);
    await expect(group).toHaveCount(1);
    await expect(page.locator('app-solve-record')).toHaveCount(1);
    await page.reload();
    await expect(group.getByRole('img')).toHaveAccessibleName(/Target User/);
    await expect(group).toHaveCount(1);
    await expectNoHorizontalOverflow(page);
  },
);
