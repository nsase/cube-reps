import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth/auth.service';
import { CubeService } from './cube';
import { UserDataRepository } from './user-data-repository';

/** グループの同期と取り込みによる分類の維持を検証する。 */
describe('CubeService group synchronization', () => {
  const account = { uid: 'account', displayName: 'User', email: null, photoURL: null };
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.inject(CubeService).ready;
  });

  it('取り込み先でグループを再利用し、元グループと計測日時を維持する', async () => {
    const cube = TestBed.inject(CubeService);
    const source = cube.addGroup('Practice')!;
    const first = cube.addSolve(1000, 'R', 'full');
    const second = cube.addSolve(2000, 'U', 'full');
    TestBed.inject(AuthService).user.set(account);
    await cube.assignSolveToAccount(first, account.uid);
    await cube.assignSolveToAccount(second, account.uid);
    const moved = cube.solves().find((solve) => solve.id === first.id)!;
    expect(moved.createdAt).toBe(first.createdAt);
    expect(moved.groupId).not.toBe(source.id);
    expect(cube.solves().find((solve) => solve.id === second.id)?.groupId).toBe(moved.groupId);
    expect(cube.groupName(moved.groupId)).toBe('Practice');
    expect(cube.groups()).toContainEqual(source);
    expect(cube.groupMutations()).toHaveLength(1);
    expect((await TestBed.inject(UserDataRepository).load()).groups).toContainEqual(
      expect.objectContaining({ id: moved.groupId, pendingSync: true, ownerId: account.uid }),
    );
  });

  it('名前変更は同期し、古い転送確認で新しい変更の再送フラグを消さない', async () => {
    const cube = TestBed.inject(CubeService);
    TestBed.inject(AuthService).user.set(account);
    const group = cube.addGroup('Before')!;
    await new Promise((resolve) => setTimeout(resolve, 2));
    cube.renameGroup(group.id, 'After');
    await cube.acknowledgeGroupSync(group);
    expect(cube.groups().find((item) => item.id === group.id)).toMatchObject({
      name: 'After',
      pendingSync: true,
    });
    const latest = cube.groupMutations().at(-1)!.data;
    await cube.acknowledgeGroupSync(latest);
    expect(cube.groups().find((item) => item.id === group.id)).not.toHaveProperty('pendingSync');
  });

  it('削除通知がSolveより先に到着してもグループを復活させない', async () => {
    const cube = TestBed.inject(CubeService);
    TestBed.inject(AuthService).user.set(account);
    const group = cube.addGroup('Deleted')!;
    const solve = cube.addSolve(1000, 'R', 'full');
    const remote = {
      ...group,
      pendingSync: undefined,
      deletedAt: '2099-01-01T00:00:00.000Z',
      updatedAt: '2099-01-01T00:00:00.000Z',
    };
    await cube.mergeAccountGroups(account.uid, [remote]);
    expect(cube.groups().some((item) => item.id === group.id)).toBe(false);
    expect(cube.solves()[0].groupId).toBe('unclassified');
    await cube.mergeAccountSolves(account.uid, [
      { ...solve, id: 'remote-solve', pendingSync: undefined },
    ]);
    expect(cube.solves().every((item) => item.groupId === 'unclassified')).toBe(true);
    await cube.mergeAccountGroups(account.uid, [{ ...group, pendingSync: undefined }]);
    expect(cube.groups().some((item) => item.id === group.id)).toBe(false);
  });

  it('別アカウントの同じIDを上書きしない', async () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('Local')!;
    await cube.mergeAccountGroups(account.uid, [
      {
        ...group,
        ownerType: 'account',
        ownerId: account.uid,
        name: 'Remote',
        updatedAt: '2099-01-01T00:00:00.000Z',
      },
    ]);
    expect(cube.groupName(group.id)).toBe('Local');
  });
  it('旧版で移行済みのアカウント記録にも名前付きグループを同期する', async () => {
    const cube = TestBed.inject(CubeService);
    const source = cube.addGroup('Legacy')!;
    const solve = cube.addSolve(1000, 'R', 'full');
    TestBed.inject(AuthService).user.set(account);
    cube.storedSolves.set([{ ...solve, ownerType: 'account', ownerId: account.uid }]);
    await cube.prepareAccountGroups(account.uid);
    expect(cube.solves()[0].createdAt).toBe(solve.createdAt);
    expect(cube.solves()[0].groupId).not.toBe(source.id);
    expect(cube.groupName(cube.solves()[0].groupId)).toBe('Legacy');
    expect(cube.groupMutations()).toHaveLength(1);
    expect(cube.solveMutations()).toHaveLength(1);
  });

  it('グループ保存の失敗時には移行元の記録を変更しない', async () => {
    const cube = TestBed.inject(CubeService);
    cube.addGroup('Practice');
    const solve = cube.addSolve(1000, 'R', 'full');
    TestBed.inject(AuthService).user.set(account);
    const repository = TestBed.inject(UserDataRepository);
    vi.spyOn(repository, 'putRecordGroup').mockRejectedValueOnce(new Error('quota'));
    await expect(cube.assignSolveToAccount(solve, account.uid)).rejects.toThrow('quota');
    expect(cube.solves()).toEqual([solve]);
    expect(cube.groupMutations()).toHaveLength(0);
    await cube.assignSolveToAccount(solve, account.uid);
    expect(cube.solves()[0].ownerId).toBe(account.uid);
    expect(cube.groupMutations()).toHaveLength(1);
  });

  it('ログイン後に未紐づけグループで計測しても現在の集計に追加される', () => {
    const cube = TestBed.inject(CubeService);
    cube.addGroup('Practice');
    TestBed.inject(AuthService).user.set(account);
    const solve = cube.addSolve(1234, 'R', 'full');
    expect(cube.activeSolves()).toEqual([solve]);
    expect(cube.groupName(solve.groupId)).toBe('Practice');
  });

  it('再起動後も未送信のグループ削除を再送できる', async () => {
    const cube = TestBed.inject(CubeService);
    TestBed.inject(AuthService).user.set(account);
    const group = cube.addGroup('Practice')!;
    cube.removeGroup(group.id);
    const restored = TestBed.runInInjectionContext(() => new CubeService());
    await restored.ready;
    expect(restored.groups().some((item) => item.id === group.id)).toBe(false);
    expect(restored.groupMutations()).toEqual([
      expect.objectContaining({
        kind: 'delete',
        data: expect.objectContaining({ id: group.id, pendingSync: true }),
      }),
    ]);
  });
});
