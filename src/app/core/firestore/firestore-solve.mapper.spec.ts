import { describe, expect, it } from 'vitest';
import { Solve } from '../cube.models';
import { USER_DATA_SCHEMA_VERSION } from '../user-data-repository';
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
