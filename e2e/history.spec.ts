import { expect, test } from '@playwright/test';

import {
  expectElementsWithin,
  expectNoHorizontalOverflow,
  expectResponsiveLayout,
} from './support/layout';

/** 履歴画面で独立して配置される主要コンポーネント。 */
const layoutItems =
  'app-history-group-panel, app-history-filter, app-history-summary, app-history-progress-chart, app-solve-history';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/history');

  await expect(page.locator('app-history')).toBeVisible();
});

test('旧localStorageの記録をIndexedDBへ移行して履歴に表示する', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'cube-reps.solves',
      JSON.stringify([
        {
          time: 1234,
          scramble: 'R U',
          date: '2026-01-01T00:00:00.000Z',
          category: 'full',
          penalty: 'none',
        },
      ]),
    );
    localStorage.setItem(
      'cube-reps.groups',
      JSON.stringify([
        {
          id: 'competition',
          name: 'Competition',
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      ]),
    );
    localStorage.setItem(
      'cube-reps.algorithm-preferences',
      JSON.stringify({
        'PLL-Aa': {
          custom: [{ id: 'user-1', notation: 'R U', builtIn: false }],
          favoriteId: 'user-1',
        },
      }),
    );
  });
  await page.reload();

  await expect(page.locator('app-solve-record')).toHaveCount(1);
  const migrated = await page.evaluate(
    () =>
      new Promise<{
        id: string;
        ownerType: string;
        ownerId: string;
        updatedAt: string;
        schemaVersion: number;
      }>((resolve, reject) => {
        const request = indexedDB.open('cube-reps');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const transaction = request.result.transaction('solves', 'readonly');
          const getAll = transaction.objectStore('solves').getAll();
          getAll.onerror = () => reject(getAll.error);
          getAll.onsuccess = () => resolve(getAll.result[0]);
        };
      }),
  );

  expect(migrated.id).toMatch(/^[0-9a-f-]{36}$/i);
  expect(migrated.ownerType).toBe('guest');
  expect(migrated.ownerId).toMatch(/^[0-9a-f-]{36}$/i);
  expect(migrated.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  expect(migrated.schemaVersion).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('cube-reps.solves'))).toBeNull();
  const related = await page.evaluate(
    () =>
      new Promise<{
        groups: Array<Record<string, unknown>>;
        preferences: Array<Record<string, unknown>>;
      }>((resolve, reject) => {
        const request = indexedDB.open('cube-reps');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const transaction = request.result.transaction(
            ['groups', 'algorithmPreferences'],
            'readonly',
          );
          const groups = transaction.objectStore('groups').getAll();
          const preferences = transaction.objectStore('algorithmPreferences').getAll();
          transaction.onerror = () => reject(transaction.error);
          transaction.oncomplete = () =>
            resolve({ groups: groups.result, preferences: preferences.result });
        };
      }),
  );
  expect(related.groups[0]).toMatchObject({
    id: 'competition',
    ownerId: migrated.ownerId,
    schemaVersion: 1,
  });
  expect(related.preferences[0]).toMatchObject({
    caseKey: 'PLL-Aa',
    ownerId: migrated.ownerId,
    schemaVersion: 1,
  });
  const custom = related.preferences[0]['custom'] as Array<{ id: string }>;
  expect(custom[0].id).toMatch(/^[0-9a-f-]{36}$/i);
  expect(related.preferences[0]['favoriteId']).toBe(custom[0].id);
  expect(await page.evaluate(() => localStorage.getItem('cube-reps.groups'))).toBeNull();
  expect(
    await page.evaluate(() => localStorage.getItem('cube-reps.algorithm-preferences')),
  ).toBeNull();
});

test('レスポンシブ配置が画面内に収まる', { tag: '@responsive' }, async ({ page }) => {
  await expectNoHorizontalOverflow(page);
  await expectResponsiveLayout(page, layoutItems);
});

test('フィルターをスクロール中も画面上部に表示する', { tag: '@responsive' }, async ({ page }) => {
  const solves = Array.from({ length: 120 }, (_, index) => ({
    id: String(index),
    time: 1000 + index,
    scramble: 'R U',
    date: new Date(index).toISOString(),
    category: 'full',
    groupId: 'unclassified',
    penalty: 'none',
  }));
  await page.evaluate((storedSolves) => {
    localStorage.setItem('cube-reps.solves', JSON.stringify(storedSolves));
  }, solves);
  await page.reload();

  const filter = page.getByTestId('history-filter');
  await expect(filter).toBeVisible();
  await expect(page.locator('app-solve-record')).toHaveCount(100);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  await expect.poll(async () => (await filter.boundingBox())?.y).toBeLessThanOrEqual(1);
  expect((await filter.boundingBox())?.y).toBeGreaterThanOrEqual(0);
  await expectNoHorizontalOverflow(page);
});

test('TimerとHistoryで選択中のグループを共有する', async ({ page }) => {
  const groups = [{ id: 'competition', name: '大会', createdAt: new Date(1).toISOString() }];
  await page.evaluate((storedGroups) => {
    localStorage.setItem('cube-reps.groups', JSON.stringify(storedGroups));
    localStorage.setItem('cube-reps.active-group', 'competition');
  }, groups);
  await page.reload();

  const historyGroup = page.getByTestId('history-group-filter');
  await expect(historyGroup).toHaveValue('competition');
  await expect(historyGroup.locator('option')).toHaveCount(2);

  await historyGroup.selectOption('unclassified');
  await page.getByRole('link', { name: /Timer/ }).click();

  await expect(page.locator('.record-context select')).toHaveValue('unclassified');
});

test('記録グループの削除後も所属記録を未分類で表示する', async ({ page }) => {
  const group = { id: 'competition', name: '大会', createdAt: new Date(1).toISOString() };
  const solve = {
    id: 'competition-solve',
    time: 1234,
    scramble: 'R U',
    date: new Date(2).toISOString(),
    category: 'full',
    groupId: group.id,
    penalty: 'none',
  };
  await page.evaluate(
    ({ storedGroup, storedSolve }) => {
      localStorage.setItem('cube-reps.groups', JSON.stringify([storedGroup]));
      localStorage.setItem('cube-reps.solves', JSON.stringify([storedSolve]));
      localStorage.setItem('cube-reps.active-group', storedGroup.id);
    },
    { storedGroup: group, storedSolve: solve },
  );
  await page.reload();

  const targetGroup = page.locator('app-record-group').filter({ hasText: '大会' });
  await targetGroup.getByTestId('record-group-delete').click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(/1.*(?:未分類|Unclassified)/s);
  await dialog.getByRole('button', { name: /削除|Delete/ }).click();

  await expect(targetGroup).toHaveCount(0);
  await expect(page.getByTestId('history-group-filter')).toHaveValue('unclassified');
  await expect(page.locator('app-solve-record')).toHaveCount(1);
  await expect(page.locator('app-solve-record .group-badge')).toHaveText(/未分類|Unclassified/);
});

test('途中のDNFを飛ばして前後の結果を線でつなぐ', async ({ page }) => {
  const solves = Array.from({ length: 6 }, (_, index) => ({
    id: String(index + 1),
    time: 10000 - index * 500,
    scramble: 'R U',
    date: new Date(6 - index).toISOString(),
    category: 'full',
    groupId: 'unclassified',
    penalty: index === 2 || index === 3 ? 'DNF' : 'none',
  }));
  await page.evaluate((storedSolves) => {
    localStorage.setItem('cube-reps.solves', JSON.stringify(storedSolves));
  }, solves);
  await page.reload();

  const resultPath = page.locator('.series-line.result');
  const resultPoints = page.locator('[data-series="result"]');
  await expect(resultPoints).toHaveCount(4);

  const commands = (await resultPath.getAttribute('d'))?.match(/[ML]/g);
  expect(commands).toEqual(['M', 'L', 'L', 'L']);
});

test('履歴のスクランブルを引き継いでタイマーでリトライする', async ({ page }) => {
  const scramble = 'R U F';
  await page.evaluate(
    ({ retryScramble }) => {
      localStorage.setItem(
        'cube-reps.solves',
        JSON.stringify([
          {
            id: 'retry-solve',
            time: 1234,
            scramble: retryScramble,
            date: new Date().toISOString(),
            category: 'full',
            groupId: 'unclassified',
            penalty: 'none',
          },
        ]),
      );
    },
    { retryScramble: scramble },
  );
  await page.reload();

  await page.getByRole('button', { name: /リトライ|Retry/ }).click();

  await expect(page).toHaveURL(/#\/timer$/);
  await expect(page.locator('app-timer-scramble p')).toHaveText(scramble);
});

test(
  'ヘッダーと記録の列を揃え、スクランブルと展開図を詳細で表示する',
  {
    tag: '@responsive',
  },
  async ({ page }, testInfo) => {
    const scramble = 'R U F';
    const solves = Array.from({ length: 1234 }, (_, index) => ({
      id: String(1234 - index),
      time: (index + 1) * 1000,
      scramble,
      date: new Date(Date.UTC(2026, 0, 12 - index)).toISOString(),
      category: 'full',
      groupId: 'unclassified',
      penalty: 'none',
    }));
    await page.evaluate((storedSolves) => {
      localStorage.setItem('cube-reps.solves', JSON.stringify(storedSolves));
    }, solves);
    await page.reload();

    const header = page.locator('.history-header');
    const firstRecord = page.locator('app-solve-record').first();
    await expect(header).toContainText(/タイム|Time/);
    await expect(header).toContainText('Ao5');
    await expect(header).toContainText('Ao12');
    await expect(header).toContainText(/日時|Date/);
    await expect(header).toContainText(/記録先|Record group/);
    await expect(firstRecord.locator('.ao5')).toHaveText('3.00');
    await expect(firstRecord.locator('.ao12')).toHaveText('6.50');
    await expect(firstRecord.locator('.record-number')).toHaveText('1234');
    await expect(firstRecord).not.toContainText('フルソルブ');
    await expect(firstRecord).not.toContainText('Ao5');
    await expect(firstRecord.locator('time')).toBeVisible();
    await expect(firstRecord.locator('code')).toHaveCount(0);

    const headerCells = header.locator('[role="columnheader"]');
    const recordCells = firstRecord.locator(
      '.record-number, .result, .ao5, .ao12, time, .group-badge',
    );
    const [headerPositions, recordPositions] = await Promise.all([
      headerCells.evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().x)),
      recordCells.evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().x)),
    ]);
    expect(recordPositions).toHaveLength(headerPositions.length);
    recordPositions.forEach((position, index) => {
      expect(Math.abs(position - headerPositions[index])).toBeLessThanOrEqual(1);
    });
    const numberFitsColumn = await firstRecord.locator('.record-number').evaluate((number) => {
      return number.scrollWidth <= number.clientWidth;
    });
    expect(numberFitsColumn).toBe(true);
    await expectElementsWithin(
      page,
      '.history',
      'app-solve-record:first-of-type .row-actions, app-solve-record:first-of-type .row-actions button',
    );
    if (testInfo.project.name === 'desktop-wide') {
      await expect(firstRecord.locator('.wide-action.row-retry')).toBeVisible();
      await expect(firstRecord.locator('.compact-action.row-retry')).toBeHidden();
    }
    if (testInfo.project.name === 'pixel-7') {
      await expect(firstRecord.locator('.wide-action.row-retry')).toBeHidden();
      await expect(firstRecord.locator('.compact-action.row-retry')).toBeVisible();
    }
    const actionGap = await firstRecord.locator('.row-actions').evaluate((actions) => {
      const details = actions.querySelector<HTMLElement>('.row-details')!;
      const firstSolveAction = actions.querySelector<HTMLElement>('app-solve-actions button')!;
      return firstSolveAction.getBoundingClientRect().left - details.getBoundingClientRect().right;
    });
    expect(actionGap).toBeLessThanOrEqual(8);

    const detailsButton = firstRecord.getByRole('button', {
      name: /計測記録の詳細を表示|View solve details/,
    });
    await detailsButton.scrollIntoViewIfNeeded();
    const sidebarPositionBeforeDialog = await page.locator('aside').boundingBox();

    await detailsButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const sidebarPositionAfterDialog = await page.locator('aside').boundingBox();
    expect(sidebarPositionAfterDialog).toEqual(sidebarPositionBeforeDialog);
    await expectElementsWithin(page, '[role="dialog"]', '.solve-actions button');
    await expect(dialog.locator('.record-number')).toHaveText('1234');
    await expect(dialog.locator('.result')).toHaveText('1.00');
    await expect(dialog.locator('code')).toHaveText(scramble);
    await expect(dialog.locator('app-solve-pattern')).toBeVisible();
    await expect(dialog.getByRole('button', { name: '+2' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'DNF' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /リトライ|Retry/ })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /削除|Delete/ })).toBeVisible();
    if (testInfo.project.name === 'desktop-wide') {
      await expect(dialog.locator('.wide-action.row-retry')).toBeVisible();
      await expect(dialog.locator('.compact-action.row-retry')).toBeHidden();
    }
    if (testInfo.project.name === 'pixel-7') {
      await expect(dialog.locator('.wide-action.row-retry')).toBeHidden();
      await expect(dialog.locator('.compact-action.row-retry')).toBeVisible();
    }
    const actionCenters = await dialog
      .locator('.solve-actions button:visible')
      .evaluateAll((buttons) =>
        buttons.map((button) => {
          const box = button.getBoundingClientRect();
          return box.top + box.height / 2;
        }),
      );
    expect(Math.max(...actionCenters) - Math.min(...actionCenters)).toBeLessThanOrEqual(1);

    await dialog.getByRole('button', { name: '+2' }).click();
    await expect(dialog.locator('.result')).toHaveText('3.00+');
  },
);
