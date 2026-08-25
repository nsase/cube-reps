import { expect, test } from '@playwright/test';

import {
  expectElementsWithin,
  expectNoHorizontalOverflow,
  expectResponsiveLayout,
} from './support/layout';

/** 履歴画面で独立して配置される主要コンポーネント。 */
const layoutItems =
  'app-history-group-panel, app-history-summary, app-history-progress-chart, app-solve-history';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/history');
  await expect(page.locator('app-history')).toBeVisible();
});

test('レスポンシブ配置が画面内に収まる', { tag: '@responsive' }, async ({ page }) => {
  await expectNoHorizontalOverflow(page);
  await expectResponsiveLayout(page, layoutItems);
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

    await firstRecord
      .getByRole('button', { name: /計測記録の詳細を表示|View solve details/ })
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expectElementsWithin(page, '[role="dialog"]', '.solve-actions button');
    await expect(dialog.locator('.record-number')).toHaveText('1234');
    await expect(dialog.locator('.result')).toHaveText('1.00');
    await expect(dialog.locator('code')).toHaveText(scramble);
    await expect(dialog.locator('app-solve-pattern')).toBeVisible();
    await expect(dialog.getByRole('button', { name: '+2' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'DNF' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /リトライ|Retry/ })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /削除|Delete/ })).toBeVisible();

    await dialog.getByRole('button', { name: '+2' }).click();
    await expect(dialog.locator('.result')).toHaveText('3.00+');
  },
);
