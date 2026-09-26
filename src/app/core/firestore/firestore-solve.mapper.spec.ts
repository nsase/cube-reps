import { describe, expect, it } from 'vitest';
import { Solve } from '../cube/cube.models';
import { USER_DATA_SCHEMA_VERSION } from '../local-storage/user-data-repository';
import { fromFirestoreSolve, toFirestoreSolve } from './firestore-solve.mapper';

describe('Firestore Solve mapper', () => {
  const solve: Solve = {
    id: '4d651998-42f1-4e63-9815-7f56bcac524d',
    time: 12345,
    scramble: 'R U',
    createdAt: '2026-08-31T10:00:00.000Z',
    updatedAt: '2026-08-31T10:01:00.000Z',
    ownerType: 'guest',
    ownerId: 'guest-id',
    schemaVersion: 1,
    category: 'pll',
    caseName: 'T',
    groupId: 'group-1',
    penalty: '+2',
  };

  /** 共通ケースIDの同期とカテゴリーとの対応を保証する。 */
  it.each([
    ['oll', 'OLL-57'],
    ['pll', 'PLL-T'],
  ] as const)('%sのcaseIdを往復変換する', (category, caseId) => {
    const document = toFirestoreSolve({ ...solve, category, caseId }, 'account-1');
    expect(fromFirestoreSolve(solve.id, document, 'account-1')).toMatchObject({ category, caseId });
    expect(
      fromFirestoreSolve(solve.id, { ...document, caseId: 'F2L-01' }, 'account-1'),
    ).toBeUndefined();
    expect(fromFirestoreSolve(solve.id, { ...document, caseId: 1 }, 'account-1')).toBeUndefined();
  });

  /** 旧F2L記録を共通モデルへ移行し、旧フィールドを再保存しない。 */
  it('旧f2lCaseIdをcaseIdとして読み込む', () => {
    const restored = fromFirestoreSolve(
      solve.id,
      {
        ...toFirestoreSolve(solve, 'account-1'),
        category: 'f2l',
        f2lCaseId: 'F2L-01',
        f2lSlot: 'FR',
      },
      'account-1',
    );
    expect(restored?.caseId).toBe('F2L-01');
    expect(restored).not.toHaveProperty('f2lCaseId');
    expect(toFirestoreSolve(restored!, 'account-1')).not.toHaveProperty('f2lCaseId');
  });

  it('F2L記録の固定ID・番号・スロットを往復変換で維持する', () => {
    const f2l: Solve = {
      ...solve,
      category: 'f2l',
      caseName: '41',
      caseId: 'F2L-41',
      f2lSlot: 'BR',
    };
    const document = toFirestoreSolve(f2l, 'account-1');
    expect(fromFirestoreSolve(f2l.id, document, 'account-1')).toMatchObject({
      category: 'f2l',
      caseName: '41',
      caseId: 'F2L-41',
      f2lSlot: 'BR',
      scramble: f2l.scramble,
    });
    for (const invalid of [
      { f2lSlot: 'XX' },
      { f2lSlot: ['FR'] },
      { caseId: 'F2L-42' },
      { f2lSlot: undefined },
      { caseName: undefined },
    ]) {
      expect(fromFirestoreSolve(f2l.id, { ...document, ...invalid }, 'account-1')).toBeUndefined();
    }
  });

  it('現行SolveをFirestore timestamp互換のDateと認証UIDを持つ保存形式へ変換する', () => {
    const stored = toFirestoreSolve(solve, 'account-1');

    expect(stored.id).toBe(solve.id);
    expect(stored.createdAt).toBeInstanceOf(Date);
    expect(stored.createdAt.toISOString()).toBe(solve.createdAt);
    expect(stored.updatedAt.toISOString()).toBe(solve.updatedAt);
    expect(stored.ownerId).toBe('account-1');
    expect(stored.ownerType).toBe('account');
    expect(stored.schemaVersion).toBe(USER_DATA_SCHEMA_VERSION);
  });

  it('ドキュメントIDを正として現行形式へ戻す', () => {
    const restored = fromFirestoreSolve(
      solve.id,
      { ...toFirestoreSolve(solve, 'account-1'), id: 'incorrect-id' },
      'account-1',
    );

    expect(restored).toEqual({
      ...solve,
      ownerType: 'account',
      ownerId: 'account-1',
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    });
  });

  it('旧ISO日時と欠落項目を現行モデルへ補完する', () => {
    const restored = fromFirestoreSolve(
      solve.id,
      {
        time: 9876,
        scramble: 'U R',
        date: '2025-01-02T03:04:05.000Z',
      },
      'account-2',
    );

    expect(restored).toEqual({
      id: solve.id,
      time: 9876,
      scramble: 'U R',
      createdAt: '2025-01-02T03:04:05.000Z',
      updatedAt: '2025-01-02T03:04:05.000Z',
      ownerType: 'account',
      ownerId: 'account-2',
      schemaVersion: 0,
      category: 'full',
      penalty: 'none',
    });
  });

  it('必須項目が壊れたドキュメントを読み込まない', () => {
    expect(
      fromFirestoreSolve(solve.id, { time: 'fast', scramble: 'R U' }, 'account-1'),
    ).toBeUndefined();
  });
  it('再送状態をFirestoreへ送らず、既存Security Rulesの形式を維持する', () => {
    const stored = toFirestoreSolve(
      {
        id: 'copy',
        time: 1000,
        scramble: 'R',
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
        ownerType: 'account',
        ownerId: 'target',
        category: 'full',
        penalty: 'none',
        schemaVersion: 2,
        pendingSync: true,
      },
      'target',
    );
    expect(stored).not.toHaveProperty('pendingSync');
  });
});
