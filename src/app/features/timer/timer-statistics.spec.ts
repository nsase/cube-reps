import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../core/cube/cube';
import { Penalty, Solve } from '../../core/cube/cube.models';
import { formatTime } from '../../core/cube/solve-time';
import { TimerStore } from './timer.store';
import { ScrambleGenerator } from './scramble-generator.service';

describe('TimerStore statistics', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ScrambleGenerator, useValue: { createScramble: () => Promise.resolve('R U') } },
        TimerStore,
      ],
    });
  });

  /** 指定時間とペナルティを持つテスト用計測記録を作成する。 */
  function solve(id: number, time: number, penalty: Penalty = 'none'): Solve {
    return {
      id: String(id),
      time,
      scramble: 'R U',
      createdAt: new Date(id).toISOString(),
      updatedAt: new Date(id).toISOString(),
      ownerType: 'guest',
      ownerId: 'guest-test',
      schemaVersion: 3,
      category: 'full',
      groupId: 'unclassified',
      penalty,
    };
  }

  it('現在のカテゴリーに属する記録件数を返す', async () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(TimerStore);
    await cube.ready;
    const other = cube.addGroup('別カテゴリー')!;
    cube.storedSolves.set([
      solve(1, 1000),
      solve(2, 2000),
      { ...solve(3, 3000), groupId: other.id },
    ]);
    cube.activeGroupId.set('unclassified');

    expect(store.activeGroupSolves()).toHaveLength(2);
  });

  it('fullとpllを同じ記録先でも別々に集計する', async () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(TimerStore);
    await cube.ready;
    cube.storedSolves.set([
      { ...solve(1, 1000), category: 'full' },
      { ...solve(2, 2000), category: 'pll' },
    ]);

    expect(store.activeGroupSolves().map(({ id }) => id)).toEqual(['1']);
    expect(store.best()).toBe(1000);

    store.category.set('pll');

    expect(store.activeGroupSolves().map(({ id }) => id)).toEqual(['2']);
    expect(store.best()).toBe(2000);
  });

  it('DNFを除外し、+2を反映してベストを計算する', async () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(TimerStore);
    await cube.ready;
    cube.storedSolves.set([solve(1, 1000, 'DNF'), solve(2, 900, '+2'), solve(3, 1500)]);

    expect(store.best()).toBe(1500);
  });

  it('全記録の平均へ+2を反映し、DNFを除外する', async () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(TimerStore);
    await cube.ready;
    cube.storedSolves.set([solve(1, 1000), solve(3, 1000, '+2'), solve(4, 4000)]);

    expect(store.mean()).toBe((1000 + 3000 + 4000) / 3);
    cube.storedSolves.update((solves) => [solve(2, 2000, 'DNF'), ...solves]);
    expect(store.mean()).toBe((1000 + 3000 + 4000) / 3);
  });

  it('有効な記録がない場合はベストと平均を未記録として扱う', async () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(TimerStore);
    await cube.ready;
    cube.storedSolves.set([solve(1, 1000, 'DNF')]);

    expect(store.best()).toBe(Infinity);
    expect(store.mean()).toBeUndefined();
    expect(formatTime(store.best())).toBe('—');
  });
  it('必要件数が揃ったAOだけを計算する', async () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(TimerStore);
    await cube.ready;
    cube.storedSolves.set(
      Array.from({ length: 12 }, (_, index) => solve(index, (index + 1) * 1000)),
    );

    expect(store.ao5()).toBe(10000);
    expect(store.ao12()).toBe(6500);
    expect(store.ao50()).toBeUndefined();
    expect(store.ao100()).toBeUndefined();
  });
});
