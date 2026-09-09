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
    createdAt: Timestamp.fromDate(new Date('2026-08-31T10:00:00.000Z')),
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
    await assertFails(setDoc(reference, solve({ createdAt: '2026-08-31T10:00:00.000Z' })));
  });

  it('tombstoneへの更新を許可し、削除済みSolveの通常更新による復活を拒否する', async () => {
    const firestore = environment.authenticatedContext(ownerId).firestore();
    const reference = doc(firestore, 'users', ownerId, 'solves', solveId);
    const deletedAt = Timestamp.fromDate(new Date('2026-09-03T10:00:00.000Z'));

    await assertSucceeds(setDoc(reference, solve()));
    await assertSucceeds(setDoc(reference, solve({ deletedAt, updatedAt: deletedAt })));
    await assertFails(setDoc(reference, solve({ time: 9999 })));
    await assertSucceeds(setDoc(reference, solve({ deletedAt, updatedAt: deletedAt, time: 9999 })));
  });
  it('グループは本人だけが読み書きでき、削除通知と日時形式を検証する', async () => {
    const reference = doc(
      environment.authenticatedContext(ownerId).firestore(),
      'users',
      ownerId,
      'groups',
      solveId,
    );
    const group = {
      id: solveId,
      name: 'Practice',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ownerType: 'account',
      ownerId,
      schemaVersion: 3,
    };
    await assertSucceeds(setDoc(reference, group));
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(
      getDocs(
        collection(
          environment.authenticatedContext(ownerId).firestore(),
          'users',
          ownerId,
          'groups',
        ),
      ),
    );
    await assertFails(setDoc(reference, { ...group, createdAt: 'invalid' }));
    await assertFails(setDoc(reference, { ...group, ownerId: otherUserId }));
    await assertFails(setDoc(reference, { ...group, pendingSync: true }));
    for (const context of [
      environment.unauthenticatedContext(),
      environment.authenticatedContext(otherUserId),
    ]) {
      const other = doc(context.firestore(), 'users', ownerId, 'groups', solveId);
      await assertFails(getDoc(other));
      await assertFails(setDoc(other, group));
      await assertFails(deleteDoc(other));
    }
    await assertSucceeds(setDoc(reference, { ...group, deletedAt: Timestamp.now() }));
    await assertFails(setDoc(reference, group));
    await assertFails(deleteDoc(reference));
  });
});
