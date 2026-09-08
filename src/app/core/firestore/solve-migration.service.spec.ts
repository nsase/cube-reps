import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { UserDataRepository } from '../user-data-repository';
import { SolveMigrationService } from './solve-migration.service';

/** テスト内でのみ使用するログイン先。 */
const account = { uid: 'account-a', displayName: 'User', email: null, photoURL: null };

describe('SolveMigrationService selected transfers', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
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
    expect(await service.transfer([first], account.uid, 'move')).toEqual({
      completed: 1,
      failed: 0,
    });
    expect(cube.guestSolves()).toEqual([second]);
    expect(cube.solveMutations().map((item) => item.data.id)).toEqual([first.id]);
    auth.user.set(null);
    expect(cube.activeSolves()).toHaveLength(2);
    const moved = cube.activeSolves().find((solve) => solve.id === first.id)!;
    expect(moved.ownerId).toBe(account.uid);
    expect(cube.canManageSolve(moved)).toBe(false);
    expect((await TestBed.inject(UserDataRepository).load()).solves).toContainEqual(moved);
  });

  it('別アカウントは新しいIDでコピーし、元記録と元所有者を維持する', async () => {
    const cube = TestBed.inject(CubeService);
    const auth = TestBed.inject(AuthService);
    auth.user.set({ ...account, uid: 'source' });
    const source = cube.addSolve(1000, 'R', 'full');
    cube.solveMutations.set([]);
    auth.user.set(account);
    const service = TestBed.inject(SolveMigrationService);
    expect(await service.transfer([source], account.uid, 'copy')).toEqual({
      completed: 1,
      failed: 0,
    });
    expect(cube.activeSolves()).toContainEqual(source);
    const copy = cube.activeSolves().find((solve) => solve.id !== source.id)!;
    expect(copy).toMatchObject({
      ownerId: account.uid,
      copiedFromId: source.id,
      time: source.time,
      pendingSync: true,
    });
    expect(cube.solveMutations().map((item) => item.data)).toEqual([copy]);
    await cube.acknowledgeSync(copy);
    expect(cube.activeSolves().find((solve) => solve.id === copy.id)?.pendingSync).toBeUndefined();
  });

  it('確認後の編集とアカウント切替を検知して未確認の内容を送らない', async () => {
    const cube = TestBed.inject(CubeService);
    const solve = cube.addSolve(1000, 'R', 'full');
    TestBed.inject(AuthService).user.set(account);
    cube.storedSolves.set([{ ...solve, updatedAt: '2099-01-01T00:00:00.000Z' }]);
    const service = TestBed.inject(SolveMigrationService);
    expect(await service.transfer([solve], account.uid, 'move')).toEqual({
      completed: 0,
      failed: 1,
    });
    TestBed.inject(AuthService).user.set(null);
    expect(await service.transfer(cube.activeSolves(), account.uid, 'move')).toEqual({
      completed: 0,
      failed: 1,
    });
    expect(cube.solveMutations()).toEqual([]);
  });

  it('保存失敗では元記録を維持し、成功分を重複させず未処理分を再試行する', async () => {
    const cube = TestBed.inject(CubeService);
    const first = cube.addSolve(1000, 'R', 'full');
    const second = cube.addSolve(2000, 'U', 'full');
    TestBed.inject(AuthService).user.set(account);
    vi.spyOn(TestBed.inject(UserDataRepository), 'putSolve').mockRejectedValueOnce(
      new Error('quota'),
    );
    const service = TestBed.inject(SolveMigrationService);
    expect(await service.transfer([first, second], account.uid, 'move')).toEqual({
      completed: 1,
      failed: 1,
    });
    expect(cube.guestSolves()).toEqual([first]);
    expect(await service.transfer([first], account.uid, 'move')).toEqual({
      completed: 1,
      failed: 0,
    });
    expect(cube.activeSolves()).toHaveLength(2);
  });
});
