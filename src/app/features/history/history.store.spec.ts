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
});
