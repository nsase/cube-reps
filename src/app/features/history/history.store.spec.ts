import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth/auth.service';
import { CubeService } from '../../core/cube';
import { HistoryStore } from './history.store';

describe('HistoryStore', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [HistoryStore] });
    await TestBed.inject(CubeService).ready;
  });

  it('TimerとHistoryで選択中のグループを共有する', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    const group = cube.addGroup('大会')!;

    expect(store.selectedGroup()).toBe(group.id);

    store.selectedGroup.set('unclassified');

    expect(cube.activeGroupId()).toBe('unclassified');
  });

  it('選択したグループの計測記録だけを返す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.addSolve(1000, 'R U', 'full');
    const group = cube.addGroup('大会')!;
    cube.addSolve(2000, 'U R', 'full');

    expect(store.filteredSolves()).toHaveLength(1);
    expect(store.filteredSolves()[0].groupId).toBe(group.id);
  });

  it('選択したsolveカテゴリーの計測記録だけを返す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.addSolve(1000, 'R U', 'full');
    cube.addSolve(2000, 'U R', 'pll', 'T');

    expect(store.filteredSolves().map(({ category }) => category)).toEqual(['full']);

    store.selectedCategory.set('pll');

    expect(store.filteredSolves().map(({ category }) => category)).toEqual(['pll']);
  });

  it('絞り込み済み履歴を100件ずつ返す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.storedSolves.set(
      Array.from({ length: 205 }, (_, index) => ({
        id: String(index + 1),
        time: 1000,
        scramble: 'R U',
        createdAt: new Date(index).toISOString(),
        updatedAt: new Date(index).toISOString(),
        ownerType: 'guest',
        ownerId: 'guest-test',
        schemaVersion: 1,
        category: 'full' as const,
        groupId: 'unclassified',
        penalty: 'none' as const,
      })),
    );

    expect(store.pagedSolves()).toHaveLength(100);

    store.setPage(2);

    expect(store.pagedSolves()).toHaveLength(5);
    expect(store.pagedSolves()[0].id).toBe('5');
  });

  it('各記録時点の通し番号とAo5・Ao12を一覧行へ設定する', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.storedSolves.set(
      Array.from({ length: 12 }, (_, index) => ({
        id: String(12 - index),
        time: (index + 1) * 1000,
        scramble: 'R U',
        createdAt: new Date(12 - index).toISOString(),
        updatedAt: new Date(12 - index).toISOString(),
        ownerType: 'guest',
        ownerId: 'guest-test',
        schemaVersion: 1,
        category: 'full' as const,
        groupId: 'unclassified',
        penalty: 'none' as const,
      })),
    );

    expect(store.pagedRows()[0]).toMatchObject({
      number: 12,
      ao5: 3000,
      ao12: 6500,
    });
    expect(store.pagedRows()[11]).toMatchObject({ number: 1 });
    expect(store.pagedRows()[11].ao5).toBeUndefined();
  });

  it('絞り込み変更と最終ページ削除時に有効なページへ戻る', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.storedSolves.set(
      Array.from({ length: 101 }, (_, index) => ({
        id: String(index + 1),
        time: 1000,
        scramble: 'R U',
        createdAt: new Date(index).toISOString(),
        updatedAt: new Date(index).toISOString(),
        ownerType: 'guest',
        ownerId: 'guest-test',
        schemaVersion: 1,
        category: 'full' as const,
        groupId: 'unclassified',
        penalty: 'none' as const,
      })),
    );
    store.setPage(1);
    cube.removeSolve('101');
    TestBed.tick();
    expect(store.pageIndex()).toBe(0);

    store.setPage(1);
    store.selectedCategory.set('pll');
    TestBed.tick();
    expect(store.pageIndex()).toBe(0);
  });
  it('所有者フィルターが集計元とページに反映され、アカウント変更で選択を解除する', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    const guest = cube.addSolve(1000, 'R', 'full');
    const account = {
      ...guest,
      id: 'other-solve',
      ownerType: 'account' as const,
      ownerId: 'other',
    };
    cube.storedSolves.set([guest, account]);
    TestBed.inject(AuthService).user.set({
      uid: 'target',
      displayName: null,
      email: null,
      photoURL: null,
    });
    TestBed.tick();
    expect(store.filteredSolves()).toHaveLength(2);
    store.toggleSelection(guest);
    expect(store.selectedSolves()).toEqual([guest]);
    store.selectedOwner.set('account:other');
    TestBed.tick();
    expect(store.filteredSolves()).toEqual([account]);
    expect(store.pagedRows().map((row) => row.solve)).toEqual([account]);
    expect(store.selectedIds().size).toBe(0);
    store.toggleSelection(account);
    TestBed.inject(AuthService).user.set(null);
    TestBed.tick();
    expect(store.selectedSolves()).toEqual([]);
    expect(store.filteredSolves()).toEqual([account]);
  });
});
