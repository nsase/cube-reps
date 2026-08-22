import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../core/cube';
import { HistoryStore } from './history.store';

describe('HistoryStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [HistoryStore] });
  });

  it('allではすべての計測記録を返す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.addSolve(1000, 'R U', 'full');
    const group = cube.addGroup('大会')!;
    cube.addSolve(2000, 'U R', 'full');

    expect(store.selectedGroup()).toBe('all');
    expect(store.filteredSolves()).toHaveLength(2);
    expect(store.filteredSolves().some((solve) => solve.groupId === group.id)).toBe(true);
  });

  it('選択したカテゴリーの計測記録だけを返す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.addSolve(1000, 'R U', 'full');
    const group = cube.addGroup('大会')!;
    cube.addSolve(2000, 'U R', 'full');

    store.selectedGroup.set(group.id);

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
    cube.solves.set(
      Array.from({ length: 205 }, (_, index) => ({
        id: index + 1,
        time: 1000,
        scramble: 'R U',
        date: new Date(index).toISOString(),
        category: 'full' as const,
        groupId: 'unclassified',
        penalty: 'none' as const,
      })),
    );

    expect(store.pagedSolves()).toHaveLength(100);

    store.setPage(2);

    expect(store.pagedSolves()).toHaveLength(5);
    expect(store.pagedSolves()[0].id).toBe(201);
  });

  it('絞り込み変更と最終ページ削除時に有効なページへ戻る', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.solves.set(
      Array.from({ length: 101 }, (_, index) => ({
        id: index + 1,
        time: 1000,
        scramble: 'R U',
        date: new Date(index).toISOString(),
        category: 'full' as const,
        groupId: 'unclassified',
        penalty: 'none' as const,
      })),
    );
    store.setPage(1);
    cube.removeSolve(101);
    TestBed.tick();
    expect(store.pageIndex()).toBe(0);

    store.setPage(1);
    store.selectedCategory.set('pll');
    TestBed.tick();
    expect(store.pageIndex()).toBe(0);
  });
});
