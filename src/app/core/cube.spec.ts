import { TestBed } from '@angular/core/testing';
import { CubeService } from './cube';
import { Penalty, Solve } from './cube.models';
import { UserDataRepository } from './user-data-repository';
import { AuthService } from './auth/auth.service';

describe('CubeService record statistics', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  });

  /** 指定時間とペナルティを持つテスト用計測記録を作成する。 */
  function solve(id: number, time: number, penalty: Penalty = 'none'): Solve {
    return {
      id: String(id),
      time,
      scramble: 'R U',
      date: new Date(id).toISOString(),
      updatedAt: new Date(id).toISOString(),
      ownerType: 'guest',
      ownerId: 'guest-test',
      schemaVersion: 1,
      category: 'full',
      groupId: 'unclassified',
      penalty,
    };
  }

  it('移行を確認したguest Solveを内容を保ったままaccount所有として永続化する', async () => {
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.ready;
    const migrated = cube.addSolve(12345, 'R U', 'full');
    TestBed.inject(AuthService).user.set({
      uid: 'account-1',
      displayName: 'Cube User',
      email: 'cube@example.com',
      photoURL: null,
    });
    await cube.assignSolveToAccount(migrated, 'account-1');

    expect(cube.guestSolves()).toHaveLength(0);
    expect(cube.solves()[0]).toMatchObject({
      id: migrated.id,
      time: migrated.time,
      ownerType: 'account',
      ownerId: 'account-1',
    });
    expect((await repository.load()).solves).toContainEqual({
      ...migrated,
      ownerType: 'account',
      ownerId: 'account-1',
    });
  });

  it('指定一覧に同じ端末guestの未変更Solveがある場合だけ移行可能と判定する', () => {
    const cube = TestBed.inject(CubeService);
    const current = cube.addSolve(12345, 'R U', 'full');

    expect(cube.isCurrentGuestSolveIn([current], current)).toBe(true);
    expect(
      cube.isCurrentGuestSolveIn([current], {
        ...current,
        updatedAt: new Date(Date.parse(current.updatedAt) + 1).toISOString(),
      }),
    ).toBe(false);
    expect(
      cube.isCurrentGuestSolveIn(
        [{ ...current, ownerType: 'account', ownerId: 'account-1' }],
        current,
      ),
    ).toBe(false);
  });

  it('現在のカテゴリーに属する記録件数を返す', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const other = cube.addGroup('別カテゴリー')!;
    cube.storedSolves.set([
      solve(1, 1000),
      solve(2, 2000),
      { ...solve(3, 3000), groupId: other.id },
    ]);
    cube.activeGroupId.set('unclassified');

    expect(cube.activeSolves()).toHaveLength(2);
  });

  it('新しい計測記録とユーザー作成カテゴリーへUUIDを割り当てる', () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('UUID確認')!;
    const solve = cube.addSolve(1000, 'R U', 'full');
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

    expect(group.id).toMatch(uuidPattern);
    expect(solve.id).toMatch(uuidPattern);
    expect(solve.id).not.toBe(group.id);
  });

  it('初期カテゴリーを英語名で作成する', () => {
    const cube = TestBed.inject(CubeService);

    expect(cube.groups()[0]).toMatchObject({ id: 'unclassified', name: 'Unclassified' });
    expect(cube.groupName('missing')).toBe('Unclassified');
  });

  it('Repositoryからユーザー作成カテゴリーだけを復元する', async () => {
    const repository = TestBed.inject(UserDataRepository);
    await repository.putRecordGroup({
      id: 'user-group',
      name: 'Competition',
      createdAt: new Date(1).toISOString(),
      updatedAt: new Date(1).toISOString(),
      ownerType: 'guest',
      ownerId: 'guest-test',
      schemaVersion: 1,
    });
    const cube = TestBed.inject(CubeService);
    await cube.ready;

    expect(cube.groups()).toEqual([
      expect.objectContaining({ id: 'unclassified', name: 'Unclassified' }),
      expect.objectContaining({ id: 'user-group', name: 'Competition' }),
    ]);
  });

  it('ユーザー作成カテゴリーをRepositoryへ保存してlocalStorageへ残さない', async () => {
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.ready;
    const putRecordGroup = vi.spyOn(repository, 'putRecordGroup');
    const group = cube.addGroup('Competition')!;
    TestBed.tick();

    expect(putRecordGroup).toHaveBeenCalledWith(group);
    expect(group).toMatchObject({
      ownerType: 'guest',
      schemaVersion: 1,
      updatedAt: group.createdAt,
    });
    expect(localStorage.getItem('cube-reps.groups')).toBeNull();
  });

  it('ユーザー作成カテゴリーの名前を変更し、既定カテゴリーは変更しない', () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('変更前')!;

    expect(cube.renameGroup(group.id, ' 変更後 ')).toBe(true);
    expect(cube.groupName(group.id)).toBe('変更後');
    expect(cube.renameGroup('unclassified', '変更不可')).toBe(false);
    expect(cube.groupName('unclassified')).not.toBe('変更不可');
  });

  it('ユーザー作成カテゴリーの削除時に所属記録を未分類へ移動する', () => {
    const cube = TestBed.inject(CubeService);
    const target = cube.addGroup('削除対象')!;
    const first = cube.addSolve(1000, 'R U', 'full');
    const second = cube.addSolve(2000, 'U R', 'full');
    const other = cube.addGroup('別グループ')!;
    const untouched = cube.addSolve(3000, 'F R', 'full');
    cube.activeGroupId.set(target.id);

    cube.removeGroup(target.id);

    expect(cube.groups()).not.toContainEqual(expect.objectContaining({ id: target.id }));
    expect(cube.solves().find(({ id }) => id === first.id)?.groupId).toBe('unclassified');
    expect(cube.solves().find(({ id }) => id === second.id)?.groupId).toBe('unclassified');
    expect(cube.solves().find(({ id }) => id === untouched.id)?.groupId).toBe(other.id);
    expect(cube.activeGroupId()).toBe('unclassified');
    expect(cube.activeSolves().map(({ id }) => id)).toEqual([second.id, first.id]);
  });

  it('リトライ対象と元の計測条件を次のタイマーへ一度だけ引き渡す', () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('Retry group')!;
    const solve = cube.addSolve(1234, 'R U', 'pll', 'Aa');

    cube.prepareRetry(solve);

    expect(cube.activeSolveCategory()).toBe('pll');
    expect(cube.activeGroupId()).toBe(group.id);
    expect(cube.takeRetrySolve()).toEqual(solve);
    expect(cube.takeRetrySolve()).toBeUndefined();
  });

  it('fullとpllを同じ記録先でも別々に集計する', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    cube.storedSolves.set([
      { ...solve(1, 1000), category: 'full' },
      { ...solve(2, 2000), category: 'pll' },
    ]);

    expect(cube.activeSolves().map(({ id }) => id)).toEqual(['1']);
    expect(cube.best()).toBe(1000);

    cube.activeSolveCategory.set('pll');

    expect(cube.activeSolves().map(({ id }) => id)).toEqual(['2']);
    expect(cube.best()).toBe(2000);
  });

  it('DNFを除外し、+2を反映してベストを計算する', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    cube.storedSolves.set([solve(1, 1000, 'DNF'), solve(2, 900, '+2'), solve(3, 1500)]);

    expect(cube.best()).toBe(1500);
  });

  it('全記録の平均へ+2を反映し、DNFを除外する', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    cube.storedSolves.set([solve(1, 1000), solve(3, 1000, '+2'), solve(4, 4000)]);

    expect(cube.mean()).toBe((1000 + 3000 + 4000) / 3);
    cube.storedSolves.update((solves) => [solve(2, 2000, 'DNF'), ...solves]);
    expect(cube.mean()).toBe((1000 + 3000 + 4000) / 3);
  });

  it('有効な記録がない場合はベストと平均を未記録として扱う', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    cube.storedSolves.set([solve(1, 1000, 'DNF')]);

    expect(cube.best()).toBe(Infinity);
    expect(cube.mean()).toBeUndefined();
    expect(cube.formatTime(cube.best())).toBe('—');
  });

  it('必要件数が揃ったAOだけを計算する', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    cube.storedSolves.set(
      Array.from({ length: 12 }, (_, index) => solve(index, (index + 1) * 1000)),
    );

    expect(cube.ao5()).toBe(3000);
    expect(cube.ao12()).toBe(6500);
    expect(cube.ao50()).toBeUndefined();
    expect(cube.ao100()).toBeUndefined();
  });

  it('通常操作で変更対象のレコードだけをRepositoryへ渡す', async () => {
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.ready;
    const putSolve = vi.spyOn(repository, 'putSolve');
    const deleteSolve = vi.spyOn(repository, 'deleteSolve');
    const putRecordGroup = vi.spyOn(repository, 'putRecordGroup');
    const deleteRecordGroup = vi.spyOn(repository, 'deleteRecordGroup');

    const group = cube.addGroup('大会')!;
    cube.renameGroup(group.id, '公式大会');
    const first = cube.addSolve(1000, 'R U', 'full');
    const second = cube.addSolve(2000, 'U R', 'full');
    cube.togglePenalty(first.id, '+2');
    cube.removeSolve(second.id);
    cube.removeGroup(group.id);

    expect(putRecordGroup).toHaveBeenCalledWith(group);
    expect(putRecordGroup).toHaveBeenCalledWith(
      expect.objectContaining({ id: group.id, name: '公式大会' }),
    );
    expect(deleteRecordGroup).toHaveBeenCalledWith(group.id);
    expect(putSolve).toHaveBeenCalledWith(first);
    expect(putSolve).toHaveBeenCalledWith(
      expect.objectContaining({ id: first.id, groupId: 'unclassified' }),
    );
    expect(deleteSolve).toHaveBeenCalledWith(second.id);
  });

  it('ログイン中の新規Solveをアカウント所有として作成し同期操作を通知する', () => {
    const auth = TestBed.inject(AuthService);
    auth.user.set({
      uid: 'account-1',
      displayName: 'Cube User',
      email: 'cube@example.com',
      photoURL: null,
    });
    const cube = TestBed.inject(CubeService);

    const created = cube.addSolve(1234, 'R U', 'full');

    expect(created).toMatchObject({ ownerType: 'account', ownerId: 'account-1' });
    expect(cube.solveMutations()).toEqual([{ kind: 'put', solve: created }]);
  });

  it('アカウントSolveはtombstoneで削除し、古い通常更新で復活させない', async () => {
    const auth = TestBed.inject(AuthService);
    auth.user.set({
      uid: 'account-1',
      displayName: 'Cube User',
      email: 'cube@example.com',
      photoURL: null,
    });
    const cube = TestBed.inject(CubeService);
    const created = cube.addSolve(1234, 'R U', 'full');

    cube.removeSolve(created.id);
    const mutation = cube.solveMutations().at(-1);
    expect(mutation?.kind).toBe('delete');
    expect(mutation?.solve.deletedAt).toBeDefined();
    expect(cube.solves()).toHaveLength(0);

    await cube.mergeAccountSolves('account-1', [created]);
    expect(cube.solves()).toHaveLength(0);
  });

  it('同一内容のFirestore通知ではSolve一覧とIndexedDBを更新しない', async () => {
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.ready;
    const accountSolve = {
      ...solve(10, 1000),
      ownerType: 'account' as const,
      ownerId: 'account-1',
    };
    cube.storedSolves.set([accountSolve]);
    const storedReference = cube.storedSolves();
    const putSolve = vi.spyOn(repository, 'putSolve');

    await cube.mergeAccountSolves('account-1', [{ ...accountSolve }]);

    expect(cube.storedSolves()).toBe(storedReference);
    expect(putSolve).not.toHaveBeenCalled();
  });

  it('Firestoreの複数変更をSolve一覧へ一括反映する', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const first = {
      ...solve(11, 1000),
      ownerType: 'account' as const,
      ownerId: 'account-1',
    };
    const second = {
      ...solve(12, 2000),
      ownerType: 'account' as const,
      ownerId: 'account-1',
    };
    const setSolves = vi.spyOn(cube.storedSolves, 'set');

    await cube.mergeAccountSolves('account-1', [first, second]);

    expect(setSolves).toHaveBeenCalledTimes(1);
    expect(cube.storedSolves()).toEqual([first, second]);
  });

  it('同一tombstoneを繰り返し受信しても再適用しない', async () => {
    const cube = TestBed.inject(CubeService);
    const repository = TestBed.inject(UserDataRepository);
    await cube.ready;
    const deletedAt = new Date(20).toISOString();
    const tombstone = {
      ...solve(20, 1000),
      updatedAt: deletedAt,
      deletedAt,
      ownerType: 'account' as const,
      ownerId: 'account-1',
    };
    cube.storedSolves.set([tombstone]);
    const storedReference = cube.storedSolves();
    const putSolve = vi.spyOn(repository, 'putSolve');

    await cube.mergeAccountSolves('account-1', [{ ...tombstone }]);

    expect(cube.storedSolves()).toBe(storedReference);
    expect(putSolve).not.toHaveBeenCalled();
  });

  it('ログアウト時にアカウントSolveを非表示にしゲストSolveだけを残す', async () => {
    const auth = TestBed.inject(AuthService);
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const guest = cube.addSolve(1000, 'R U', 'full');
    const accountSolve = { ...solve(2, 2000), ownerType: 'account' as const, ownerId: 'account-1' };

    await cube.mergeAccountSolves('account-1', [accountSolve]);
    auth.user.set({
      uid: 'account-1',
      displayName: 'Cube User',
      email: 'cube@example.com',
      photoURL: null,
    });
    expect(cube.solves().map(({ id }) => id)).toEqual([guest.id, accountSolve.id]);
    expect(cube.accountSolves()).toEqual([accountSolve]);

    auth.user.set(null);
    expect(cube.solves().map(({ id }) => id)).toEqual([guest.id]);
    expect(cube.accountSolves()).toEqual([]);
    expect(cube.storedSolves().map(({ id }) => id)).toEqual([guest.id, accountSolve.id]);
  });
});
