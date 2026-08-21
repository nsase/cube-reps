import { TestBed } from '@angular/core/testing';
import { CubeService } from './cube';
import { Penalty, Solve } from './cube.models';

describe('CubeService record statistics', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  });

  /** 指定時間とペナルティを持つテスト用計測記録を作成する。 */
  function solve(id: number, time: number, penalty: Penalty = 'none'): Solve {
    return {
      id,
      time,
      scramble: 'R U',
      date: new Date(id).toISOString(),
      mode: '3x3',
      groupId: 'unclassified',
      penalty,
    };
  }

  it('現在のカテゴリーに属する記録件数を返す', () => {
    const cube = TestBed.inject(CubeService);
    const other = cube.addGroup('別カテゴリー')!;
    cube.solves.set([solve(1, 1000), solve(2, 2000), { ...solve(3, 3000), groupId: other.id }]);
    cube.activeGroupId.set('unclassified');

    expect(cube.activeSolves()).toHaveLength(2);
  });

  it('DNFを除外し、+2を反映してベストを計算する', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([solve(1, 1000, 'DNF'), solve(2, 900, '+2'), solve(3, 1500)]);

    expect(cube.best()).toBe(1500);
  });

  it('DNFを除いた直近5件へ+2を反映して平均を計算する', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([
      solve(1, 1000),
      solve(2, 2000, 'DNF'),
      solve(3, 1000, '+2'),
      solve(4, 4000),
      solve(5, 5000),
      solve(6, 6000),
      solve(7, 100000),
    ]);

    expect(cube.average()).toBe((1000 + 3000 + 4000 + 5000 + 6000) / 5);
  });

  it('有効な記録がない場合はベストと平均を未記録として扱う', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([solve(1, 1000, 'DNF')]);

    expect(cube.best()).toBe(Infinity);
    expect(cube.average()).toBe(Infinity);
    expect(cube.formatTime(cube.best())).toBe('—');
  });
});
