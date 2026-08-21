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
    cube.addSolve(1000, 'R U', '3x3');
    const group = cube.addGroup('大会')!;
    cube.addSolve(2000, 'U R', '3x3');

    expect(store.selectedGroup()).toBe('all');
    expect(store.filteredSolves()).toHaveLength(2);
    expect(store.filteredSolves().some((solve) => solve.groupId === group.id)).toBe(true);
  });

  it('選択したカテゴリーの計測記録だけを返す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    cube.addSolve(1000, 'R U', '3x3');
    const group = cube.addGroup('大会')!;
    cube.addSolve(2000, 'U R', '3x3');

    store.selectedGroup.set(group.id);

    expect(store.filteredSolves()).toHaveLength(1);
    expect(store.filteredSolves()[0].groupId).toBe(group.id);
  });
});
