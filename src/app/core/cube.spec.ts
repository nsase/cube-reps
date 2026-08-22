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
      id: String(id),
      time,
      scramble: 'R U',
      date: new Date(id).toISOString(),
      category: 'full',
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

  it('既定カテゴリーを保存対象から除外してユーザー作成カテゴリーだけを復元する', () => {
    localStorage.setItem(
      'cubeflow-groups',
      JSON.stringify([
        { id: 'unclassified', name: 'Stored default', createdAt: new Date(0).toISOString() },
        { id: 'user-group', name: 'Competition', createdAt: new Date(1).toISOString() },
      ]),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    expect(TestBed.inject(CubeService).groups()).toEqual([
      expect.objectContaining({ id: 'unclassified', name: 'Unclassified' }),
      expect.objectContaining({ id: 'user-group', name: 'Competition' }),
    ]);
  });

  it('localStorageにはユーザー作成カテゴリーだけを保存する', () => {
    const cube = TestBed.inject(CubeService);
    cube.addGroup('Competition');
    TestBed.tick();

    expect(JSON.parse(localStorage.getItem('cubeflow-groups') ?? '[]')).toEqual([
      expect.objectContaining({ name: 'Competition' }),
    ]);
  });

  it('ユーザー作成カテゴリーの名前を変更し、既定カテゴリーは変更しない', () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('変更前')!;

    expect(cube.renameGroup(group.id, ' 変更後 ')).toBe(true);
    expect(cube.groupName(group.id)).toBe('変更後');
    expect(cube.renameGroup('unclassified', '変更不可')).toBe(false);
    expect(cube.groupName('unclassified')).not.toBe('変更不可');
  });

  it('fullとpllを同じ記録先でも別々に集計する', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([
      { ...solve(1, 1000), category: 'full' },
      { ...solve(2, 2000), category: 'pll' },
    ]);

    expect(cube.activeSolves().map(({ id }) => id)).toEqual(['1']);
    expect(cube.best()).toBe(1000);

    cube.activeSolveCategory.set('pll');

    expect(cube.activeSolves().map(({ id }) => id)).toEqual(['2']);
    expect(cube.best()).toBe(2000);
  });

  it('DNFを除外し、+2を反映してベストを計算する', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([solve(1, 1000, 'DNF'), solve(2, 900, '+2'), solve(3, 1500)]);

    expect(cube.best()).toBe(1500);
  });

  it('全記録の平均へ+2を反映し、DNFを除外する', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([solve(1, 1000), solve(3, 1000, '+2'), solve(4, 4000)]);

    expect(cube.mean()).toBe((1000 + 3000 + 4000) / 3);
    cube.solves.update((solves) => [solve(2, 2000, 'DNF'), ...solves]);
    expect(cube.mean()).toBe((1000 + 3000 + 4000) / 3);
  });

  it('有効な記録がない場合はベストと平均を未記録として扱う', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([solve(1, 1000, 'DNF')]);

    expect(cube.best()).toBe(Infinity);
    expect(cube.mean()).toBeUndefined();
    expect(cube.formatTime(cube.best())).toBe('—');
  });

  it('必要件数が揃ったAOだけを計算する', () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set(Array.from({ length: 12 }, (_, index) => solve(index, (index + 1) * 1000)));

    expect(cube.ao5()).toBe(3000);
    expect(cube.ao12()).toBe(6500);
    expect(cube.ao50()).toBeUndefined();
    expect(cube.ao100()).toBeUndefined();
  });
});
