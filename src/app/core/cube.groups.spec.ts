import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth/auth.service';
import { CubeService } from './cube';
import { RecordGroup, Solve } from './cube.models';
import { FirestoreSyncService } from './firestore/firestore-sync.service';
import { LocalSyncService } from './local/local-sync.service';
import { UserDataRepository } from './user-data-repository';

/** グループの同期と取り込みによる分類の維持を検証する。 */
describe('CubeService group synchronization', () => {
  const account = { uid: 'account', displayName: 'User', email: null, photoURL: null };
  const group: RecordGroup = {
    id: 'remote-group',
    name: 'Practice',
    ownerType: 'account',
    ownerId: account.uid,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    schemaVersion: 3,
  };
  const solve: Solve = {
    ...group,
    id: 'remote-solve',
    groupId: group.id,
    time: 1000,
    scramble: 'R',
    category: 'full',
    penalty: 'none',
  };
  const deleted = {
    ...group,
    updatedAt: '2026-02-01T00:00:00.000Z',
    deletedAt: '2026-02-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.inject(LocalSyncService);
    TestBed.inject(FirestoreSyncService);
    await TestBed.inject(CubeService).ready;
  });

  it('一部のSolve移行で同じグループをアカウント所有にし、未選択Solveはゲストのまま残す', async () => {
    const cube = TestBed.inject(CubeService);
    const source = cube.addGroup('Practice')!;
    const first = cube.addSolve(1000, 'R', 'full');
    const second = cube.addSolve(2000, 'U', 'full');
    TestBed.inject(AuthService).user.set(account);
    cube.assignSolveToAccount(first, account.uid);
    TestBed.tick();
    expect(cube.activeSolves().find((item) => item.id === first.id)).toMatchObject({
      groupId: source.id,
      ownerId: account.uid,
      createdAt: first.createdAt,
    });
    expect(cube.guestSolves()).toEqual([second]);
    expect(cube.userGroups()).toEqual([
      expect.objectContaining({ id: source.id, ownerId: account.uid, pendingSync: true }),
    ]);
    expect(TestBed.inject(FirestoreSyncService).groupMutations()).toHaveLength(1);
    expect((await TestBed.inject(UserDataRepository).load()).groups).toEqual(cube.userGroups());
    TestBed.inject(AuthService).user.set(null);
    expect(cube.canManageGroup(source.id)).toBe(false);
  });

  it('ゲストグループへのログイン後の新規計測も、グループを増やさず同期する', () => {
    const cube = TestBed.inject(CubeService);
    const source = cube.addGroup('Practice')!;
    TestBed.inject(AuthService).user.set(account);
    const created = cube.addSolve(1234, 'R', 'full');
    expect(cube.activeGroupSolves()).toEqual([created]);
    expect(cube.userGroups()).toEqual([
      expect.objectContaining({ id: source.id, ownerId: account.uid }),
    ]);
    expect(TestBed.inject(FirestoreSyncService).groupMutations()).toHaveLength(1);
  });

  it('古い転送確認で新しい名前を上書きせず、最新版の成功時だけ再送フラグを消す', async () => {
    const cube = TestBed.inject(CubeService);
    TestBed.inject(AuthService).user.set(account);
    const original = cube.addGroup('Before')!;
    const latest = { ...original, name: 'After', updatedAt: '2099-01-01T00:00:00.000Z' };
    cube.userGroups.set([latest]);
    await cube.groupSyncFinished(original);
    expect(cube.userGroups()).toEqual([latest]);
    await cube.groupSyncFinished(latest);
    expect(cube.userGroups()[0]).toMatchObject({ name: 'After' });
    expect(cube.userGroups()[0].pendingSync).toBeUndefined();
  });

  for (const order of ['group-first', 'solve-first'] as const) {
    it(`${order}: 削除通知をメモリに残し、所属Solveだけを未分類として保存する`, async () => {
      const cube = TestBed.inject(CubeService);
      const repository = TestBed.inject(UserDataRepository);
      const sync = TestBed.inject(FirestoreSyncService);
      if (order === 'group-first') {
        await cube.mergeGroups([deleted]);
        await cube.mergeSolves([solve]);
      } else {
        await cube.mergeGroups([group]);
        await cube.mergeSolves([solve]);
        cube.activeGroupId.set(group.id);
        await cube.mergeGroups([deleted]);
      }
      expect(cube.userGroups()).toEqual([deleted]);
      expect(cube.activeGroups().map((item) => item.id)).toEqual(['unclassified']);
      expect(cube.activeGroupId()).toBe('unclassified');
      expect(cube.activeSolves()[0].groupId).toBe('unclassified');
      expect((await repository.load()).groups).toEqual([]);
      expect((await repository.load()).solves).toEqual([{ ...solve, groupId: 'unclassified' }]);
      expect(sync.solveMutations()).toEqual([]);
      expect(sync.groupMutations()).toEqual([]);
    });
  }

  it('未送信のグループ削除は保存し、送信成功後にIndexedDBからだけ削除する', async () => {
    const cube = TestBed.inject(CubeService);
    TestBed.inject(AuthService).user.set(account);
    const created = cube.addGroup('Practice')!;
    cube.removeGroup(created.id);
    TestBed.tick();
    const tombstone = cube.userGroups()[0];
    const repository = TestBed.inject(UserDataRepository);
    expect((await repository.load()).groups).toEqual([tombstone]);
    expect(tombstone.pendingSync).toBe(true);
    await cube.groupSyncFinished(tombstone);
    expect((await repository.load()).groups).toEqual([]);
    expect(cube.userGroups()[0].deletedAt).toBe(tombstone.deletedAt);
    expect(cube.userGroups()[0].pendingSync).toBeUndefined();
  });

  it('同期待ちのグループは古いリモート版で上書きしない', async () => {
    const cube = TestBed.inject(CubeService);
    const local = { ...group, name: 'Local', pendingSync: true };
    cube.userGroups.set([local]);
    await cube.mergeGroups([{ ...group, name: 'Remote', updatedAt: deleted.updatedAt }]);
    expect(cube.userGroups()).toEqual([local]);
  });
  it('ログインだけでは既存のゲストグループを移行しない', () => {
    const cube = TestBed.inject(CubeService);
    const guest = cube.addGroup('Guest')!;
    TestBed.inject(AuthService).user.set(account);
    TestBed.tick();
    expect(cube.userGroups()).toEqual([guest]);
    expect(TestBed.inject(FirestoreSyncService).groupMutations()).toEqual([]);
  });

  it('新しい名称を採用し、同一版と古い版の再取得でSignalや保存先を更新しない', async () => {
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.mergeGroups([group]);
    const renamed = { ...group, name: 'Renamed', updatedAt: '2026-02-01T00:00:00.000Z' };
    await cube.mergeGroups([renamed]);
    expect(cube.groupName(group.id)).toBe('Renamed');
    const current = cube.userGroups();
    const solvesBefore = cube.storedSolves();
    const put = vi.spyOn(repository, 'putRecordGroup');
    await cube.mergeGroups([{ ...renamed }]);
    await cube.mergeGroups([group]);
    expect(cube.userGroups()).toBe(current);
    expect(cube.storedSolves()).toBe(solvesBefore);
    expect(put).not.toHaveBeenCalled();
  });

  it('未知の削除通知の再取得でSignalや永続化を更新しない', async () => {
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.mergeGroups([deleted]);
    const current = cube.userGroups();
    const solvesBefore = cube.storedSolves();
    const remove = vi.spyOn(repository, 'deleteRecordGroup');
    await cube.mergeGroups([{ ...deleted }]);
    expect(cube.userGroups()).toBe(current);
    expect(cube.storedSolves()).toBe(solvesBefore);
    expect(remove).not.toHaveBeenCalled();
  });

  it('削除通知は端末時計が進んだ名称更新より優先し、通常版で復活しない', async () => {
    const cube = TestBed.inject(CubeService);
    const future = { ...group, updatedAt: '2099-01-01T00:00:00.000Z' };
    await cube.mergeGroups([future]);
    await cube.mergeSolves([solve]);
    await cube.mergeGroups([deleted]);
    expect(cube.activeGroups().map((item) => item.id)).not.toContain(group.id);
    expect(cube.activeSolves()[0].groupId).toBe('unclassified');
    await cube.mergeGroups([future]);
    expect(cube.activeGroups().map((item) => item.id)).not.toContain(group.id);
  });
  it('未送信の名称変更より削除を優先し、遅れた送信完了でも復活しない', async () => {
    const cube = TestBed.inject(CubeService);
    const pending = { ...group, name: 'Pending', pendingSync: true };
    cube.userGroups.set([pending]);
    await cube.mergeGroups([deleted]);
    await cube.groupSyncFinished(pending);
    expect(cube.userGroups()).toEqual([deleted]);
    expect(cube.activeGroups().map((item) => item.id)).not.toContain(group.id);
  });
});
