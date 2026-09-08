import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { LocalSyncService } from '../local/local-sync.service';
import { UserDataRepository } from '../user-data-repository';
import { FirestoreSyncService } from './firestore-sync.service';
import { SolveMigrationService } from './solve-migration.service';

/** テスト内でのみ使用するログイン先。 */
const account = { uid: 'account-a', displayName: 'User', email: null, photoURL: null };

describe('SolveMigrationService selected transfers', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.inject(LocalSyncService);
    TestBed.inject(FirestoreSyncService);
    await TestBed.inject(CubeService).ready;
  });

  it('ログインだけでは移行せず、選択した未紐づけだけを移行してログアウト後も表示する', async () => {
    const cube = TestBed.inject(CubeService);
    const first = cube.addSolve(1000, 'R', 'full');
    const second = cube.addSolve(2000, 'U', 'full');
    const auth = TestBed.inject(AuthService);
    auth.user.set(account);
    const service = TestBed.inject(SolveMigrationService);
    TestBed.tick();
    expect(cube.guestSolves()).toHaveLength(2);
    service.transfer([first], account.uid, 'move');
    TestBed.tick();
    expect(cube.guestSolves()).toEqual([second]);
    expect(
      TestBed.inject(FirestoreSyncService)
        .solveMutations()
        .map((item) => item.data.id),
    ).toEqual([first.id]);
    auth.user.set(null);
    expect(cube.activeSolves()).toHaveLength(2);
    const moved = cube.activeSolves().find((solve) => solve.id === first.id)!;
    expect(moved).toMatchObject({
      ownerId: account.uid,
      createdAt: first.createdAt,
      time: first.time,
    });
    expect(cube.canManageSolve(moved)).toBe(false);
    expect((await TestBed.inject(UserDataRepository).load()).solves).toContainEqual(moved);
    expect(service.pending()).toBe(false);
  });

  it('別アカウントは新しいIDでコピーし、元記録と元所有者を維持して両方を保存する', async () => {
    const cube = TestBed.inject(CubeService);
    const auth = TestBed.inject(AuthService);
    auth.user.set({ ...account, uid: 'source' });
    const source = cube.addSolve(1000, 'R', 'full');
    const sync = TestBed.inject(FirestoreSyncService);
    sync.solveMutations.set([]);
    auth.user.set(account);
    TestBed.inject(SolveMigrationService).transfer([source], account.uid, 'copy');
    TestBed.tick();
    expect(cube.activeSolves()).toHaveLength(2);
    expect(cube.activeSolves()).toContainEqual(source);
    const copy = cube.activeSolves().find((solve) => solve.id !== source.id)!;
    expect(copy).toMatchObject({
      ownerId: account.uid,
      time: source.time,
      createdAt: source.createdAt,
      pendingSync: true,
    });
    expect(sync.solveMutations().map((item) => item.data)).toEqual([copy]);
    expect((await TestBed.inject(UserDataRepository).load()).solves).toEqual(
      expect.arrayContaining([source, copy]),
    );
    await cube.solveSyncFinished(copy);
    expect(cube.activeSolves().find((solve) => solve.id === copy.id)?.pendingSync).toBeUndefined();
  });

  it('確認時のアカウントから切り替わった場合とログアウト中は移行しない', () => {
    const cube = TestBed.inject(CubeService);
    const solve = cube.addSolve(1000, 'R', 'full');
    const auth = TestBed.inject(AuthService);
    const service = TestBed.inject(SolveMigrationService);
    for (const user of [null, { ...account, uid: 'other' }]) {
      auth.user.set(user);
      service.transfer([solve], account.uid, 'move');
      expect(cube.guestSolves()).toEqual([solve]);
      expect(service.pending()).toBe(false);
    }
    expect(TestBed.inject(FirestoreSyncService).solveMutations()).toEqual([]);
  });

  it('処理中にアカウントが変わると後続の記録を移行しない', () => {
    const cube = TestBed.inject(CubeService);
    const first = cube.addSolve(1000, 'R', 'full');
    const second = cube.addSolve(2000, 'U', 'full');
    const auth = TestBed.inject(AuthService);
    auth.user.set(account);
    const subscription = cube.solveChange$.subscribe(() => auth.user.set(null));
    TestBed.inject(SolveMigrationService).transfer([first, second], account.uid, 'move');
    expect(cube.guestSolves()).toEqual([second]);
    expect(TestBed.inject(SolveMigrationService).pending()).toBe(false);
    subscription.unsubscribe();
  });
});
