import { expect, test } from '@playwright/test';

import { expectNoHorizontalOverflow, expectResponsiveLayout } from './support/layout';

/** 履歴画面で独立して配置される主要コンポーネント。 */
const layoutItems =
  'app-history-group-panel, app-history-summary, app-history-progress-chart, app-solve-history';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/history');
  await expect(page.locator('app-history')).toBeVisible();
});

test('レスポンシブ配置が画面内に収まる', async ({ page }) => {
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

  await page.getByRole('button', { name: /この記録をリトライ|Retry solve/ }).click();

  await expect(page).toHaveURL(/#\/timer$/);
  await expect(page.locator('app-timer-scramble p')).toHaveText(scramble);
});

test('一覧にAoと日時を表示し、スクランブルと展開図を詳細で表示する', async ({ page }) => {
  const scramble = 'R U F';
  const solves = Array.from({ length: 12 }, (_, index) => ({
    id: String(12 - index),
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

  const firstRecord = page.locator('app-solve-record').first();
  await expect(firstRecord.locator('.averages')).toContainText('Ao5');
  await expect(firstRecord.locator('.averages')).toContainText('3.00');
  await expect(firstRecord.locator('.averages')).toContainText('6.50');
  await expect(firstRecord.locator('time')).toBeVisible();
  await expect(firstRecord.locator('code')).toHaveCount(0);

  await firstRecord
    .getByRole('button', { name: /計測記録の詳細を表示|View solve details/ })
    .click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('code')).toHaveText(scramble);
  await expect(dialog.locator('app-solve-pattern')).toBeVisible();
});
