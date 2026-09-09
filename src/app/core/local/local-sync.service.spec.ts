import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { StoredUserData, UserDataRepository } from '../user-data-repository';
import { LocalSyncService } from './local-sync.service';

/** クラウド通信と独立したローカル保存を検証する。 */
describe('LocalSyncService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('ゲストとアカウントの変更を保存し、空キューでは追加書き込みを行わない', async () => {
    const local = TestBed.inject(LocalSyncService);
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.ready;
    const putSolve = vi.spyOn(repository, 'putSolve');
    const putGroup = vi.spyOn(repository, 'putRecordGroup');
    const guestGroup = cube.addGroup('Guest')!;
    const guest = cube.addSolve(1000, 'R', 'full');
    TestBed.inject(AuthService).user.set({
      uid: 'account',
      displayName: null,
      email: null,
      photoURL: null,
    });
    const accountGroup = cube.addGroup('Account')!;
    const account = cube.addSolve(2000, 'U', 'full');
    TestBed.tick();
    expect((await repository.load()).solves).toEqual([guest, account]);
    expect((await repository.load()).groups).toEqual([guestGroup, accountGroup]);
    expect(local.solveMutations()).toEqual([]);
    expect(local.groupMutations()).toEqual([]);
    TestBed.tick();
    expect(putSolve).toHaveBeenCalledTimes(2);
    expect(putGroup).toHaveBeenCalledTimes(2);
    cube.removeSolve(guest.id);
    cube.removeGroup(guestGroup.id);
    cube.removeSolve(account.id);
    cube.removeGroup(accountGroup.id);
    TestBed.tick();
    const stored = await repository.load();
    expect(stored.solves).toEqual([
      expect.objectContaining({ id: account.id, pendingSync: true, deletedAt: expect.any(String) }),
    ]);
    expect(stored.groups).toEqual([
      expect.objectContaining({
        id: accountGroup.id,
        pendingSync: true,
        deletedAt: expect.any(String),
      }),
    ]);
  });

  it('初期ロード中の変更は保留し、復元データと合わせて保存する', async () => {
    const repository = TestBed.inject(UserDataRepository);
    let finish!: (data: StoredUserData) => void;
    vi.spyOn(repository, 'load').mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const putSolve = vi.spyOn(repository, 'putSolve');
    const putGroup = vi.spyOn(repository, 'putRecordGroup');
    TestBed.inject(LocalSyncService);
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('Early')!;
    const solve = cube.addSolve(1000, 'R', 'full');
    TestBed.tick();
    expect(putSolve).not.toHaveBeenCalled();
    expect(putGroup).not.toHaveBeenCalled();
    finish({ solves: [], groups: [], accounts: [], algorithmPreferences: [] });
    await cube.ready;
    TestBed.tick();
    expect((await repository.load()).solves).toEqual([solve]);
    expect((await repository.load()).groups).toEqual([group]);
  });
});
