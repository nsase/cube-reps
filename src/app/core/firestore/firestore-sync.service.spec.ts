import { TestBed } from '@angular/core/testing';
import { CubeService } from '../cube/cube';
import { RecordGroup, Solve } from '../cube/cube.models';
import { LocalSyncService } from '../local-storage/local-sync.service';
import { UserDataRepository } from '../local-storage/user-data-repository';
import { FirestoreSyncService } from './firestore-sync.service';

/** 永続化済みの変更からクラウド再送を復元する境界を検証する。 */
describe('FirestoreSyncService pending restoration', () => {
  const group: RecordGroup = {
    id: 'group',
    name: 'Practice',
    ownerType: 'account',
    ownerId: 'account',
    pendingSync: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    schemaVersion: 3,
  };
  const solve: Solve = {
    ...group,
    id: 'solve',
    groupId: group.id,
    time: 1000,
    scramble: 'R',
    category: 'full',
    penalty: 'none',
  };
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('未送信の更新と削除を全アカウント分復元し、保存済みデータを再保存しない', async () => {
    const repository = TestBed.inject(UserDataRepository);
    const deletedGroup = {
      ...group,
      id: 'deleted-group',
      ownerId: 'other',
      deletedAt: group.updatedAt,
    };
    const deletedSolve = {
      ...solve,
      id: 'deleted-solve',
      groupId: 'unclassified',
      ownerId: 'other',
      deletedAt: solve.updatedAt,
    };
    for (const item of [
      group,
      deletedGroup,
      { ...group, id: 'synced', pendingSync: false },
      { ...group, id: 'guest', ownerType: 'guest' as const, pendingSync: false },
    ])
      await repository.putRecordGroup(item);
    for (const item of [
      solve,
      deletedSolve,
      { ...solve, id: 'synced', pendingSync: false },
      { ...solve, id: 'guest', ownerType: 'guest' as const, pendingSync: false },
    ])
      await repository.putSolve(item);
    const putGroup = vi.spyOn(repository, 'putRecordGroup');
    const putSolve = vi.spyOn(repository, 'putSolve');
    TestBed.inject(LocalSyncService);
    const sync = TestBed.inject(FirestoreSyncService);
    await TestBed.inject(CubeService).ready;
    TestBed.tick();
    expect(sync.groupMutations()).toEqual([
      { kind: 'put', data: group },
      { kind: 'delete', data: deletedGroup },
    ]);
    expect(sync.solveMutations()).toEqual([
      { kind: 'put', data: solve },
      { kind: 'delete', data: deletedSolve },
    ]);
    expect(putGroup).not.toHaveBeenCalled();
    expect(putSolve).not.toHaveBeenCalled();
  });

  it('復元されたゲストグループも参照し、所有者変更は一度だけキューに入れる', async () => {
    const repository = TestBed.inject(UserDataRepository);
    await repository.putRecordGroup({
      ...group,
      ownerType: 'guest',
      ownerId: undefined,
      pendingSync: false,
    });
    await repository.putSolve(solve);
    TestBed.inject(LocalSyncService);
    const sync = TestBed.inject(FirestoreSyncService);
    await TestBed.inject(CubeService).ready;
    TestBed.tick();
    expect(sync.solveMutations()).toEqual([{ kind: 'put', data: solve }]);
    expect(sync.groupMutations()).toEqual([
      {
        kind: 'put',
        data: expect.objectContaining({
          id: group.id,
          ownerId: 'account',
          ownerType: 'account',
          pendingSync: true,
        }),
      },
    ]);
    expect((await repository.load()).groups[0].ownerId).toBe('account');
  });
});
