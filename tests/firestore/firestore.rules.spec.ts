import {
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

const projectId = 'demo-cube-reps';
const ownerId = 'owner-user';
const otherUserId = 'other-user';
const solveId = '4d651998-42f1-4e63-9815-7f56bcac524d';

function solve(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: solveId,
    time: 12345,
    scramble: 'R U',
    date: Timestamp.fromDate(new Date('2026-08-31T10:00:00.000Z')),
    updatedAt: Timestamp.fromDate(new Date('2026-08-31T10:01:00.000Z')),
    ownerType: 'account',
    ownerId,
    schemaVersion: 1,
    category: 'full',
    penalty: 'none',
    ...overrides,
  };
}

describe('Firestore Solve Security Rules', () => {
  let environment: RulesTestEnvironment;

  beforeAll(async () => {
    environment = await initializeTestEnvironment({
      projectId,
      firestore: { rules: await readFile('firestore.rules', 'utf8') },
    });
  });

  afterEach(async () => environment.clearFirestore());
  afterAll(async () => environment.cleanup());

  it('本人がUUIDをドキュメントIDとして追加・取得・更新・削除できる', async () => {
    const firestore = environment.authenticatedContext(ownerId).firestore();
    const reference = doc(firestore, 'users', ownerId, 'solves', solveId);

    await assertSucceeds(setDoc(reference, solve()));
    expect((await assertSucceeds(getDoc(reference))).data()?.['id']).toBe(solveId);
    await assertSucceeds(setDoc(reference, solve({ time: 15000 })));
    expect((await getDoc(reference)).data()?.['time']).toBe(15000);
    await assertSucceeds(deleteDoc(reference));
    expect((await getDoc(reference)).exists()).toBe(false);
  });

  it('本人が自分のSolve一覧を取得できる', async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', ownerId, 'solves', solveId), solve());
    });
    const firestore = environment.authenticatedContext(ownerId).firestore();

    expect(
      (await assertSucceeds(getDocs(collection(firestore, 'users', ownerId, 'solves')))).size,
    ).toBe(1);
  });

  it('未認証ユーザーの読み書きを拒否する', async () => {
    const reference = doc(
      environment.unauthenticatedContext().firestore(),
      'users',
      ownerId,
      'solves',
      solveId,
    );

    await assertFails(setDoc(reference, solve()));
    await assertFails(getDoc(reference));
  });

  it('別ユーザーによる読み書きと削除を拒否する', async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', ownerId, 'solves', solveId), solve());
    });
    const reference = doc(
      environment.authenticatedContext(otherUserId).firestore(),
      'users',
      ownerId,
      'solves',
      solveId,
    );

    await assertFails(getDoc(reference));
    await assertFails(setDoc(reference, solve({ ownerId: otherUserId })));
    await assertFails(deleteDoc(reference));
  });

  it('ID不一致や所有者偽装、不正な形式を拒否する', async () => {
    const firestore = environment.authenticatedContext(ownerId).firestore();
    const reference = doc(firestore, 'users', ownerId, 'solves', solveId);

    await assertFails(setDoc(reference, solve({ id: 'different-id' })));
    await assertFails(setDoc(reference, solve({ ownerId: otherUserId })));
    await assertFails(setDoc(reference, solve({ date: '2026-08-31T10:00:00.000Z' })));
  });
});
