import { TestBed } from '@angular/core/testing';
import { F2L_CASES } from '../../core/algorithm/algorithm-cases';
import { f2lCaseForSlot } from '../../core/algorithm/algorithm-cases/f2l/f2l-case';
import { CubeService } from '../../core/cube/cube';
import { TimerStore } from './timer.store';

/** F2Lの計測条件がスクランブル・保存・再計測を通して一致することを検証する。 */
describe('Timer F2L', () => {
  beforeEach(() => {
    vi.spyOn(CubeService.prototype, 'createScramble').mockResolvedValue('R U');
    TestBed.configureTestingModule({ providers: [TimerStore] });
  });
  afterEach(() => vi.restoreAllMocks());

  it('41ケース×4スロットを共通Setupと持ち替えで出題し、対象を記録する', () => {
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);
    store.setCategory('f2l');
    for (const [index, item] of F2L_CASES.entries()) {
      store.selectedCase.set(index);
      store.newScramble();
      for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
        store.setSlot(slot);
        const expected = f2lCaseForSlot(item, slot);
        expect(store.scramble()).toBe(expected.setup);
        expect(store.currentDrillCase()).toEqual(expected);
        store.state.set('ready');
        store.release();
        store.elapsed.set(1234);
        store.press();
        expect(
          cube.activeSolves().find((solve) => solve.id === store.completedSolve()?.id),
        ).toMatchObject({
          time: 1234,
          category: 'f2l',
          caseName: item.number,
          caseId: item.caseId,
          f2lSlot: slot,
          scramble: expected.setup,
        });
      }
    }
    expect(cube.activeSolves()).toHaveLength(164);
  });

  it('ランダム出題後のスロット変更でケースを維持し、直前の再計測では元ケースへ戻る', () => {
    const store = TestBed.inject(TimerStore);
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    store.setCategory('f2l');
    store.setSlot('BL');
    expect(store.currentDrillCase().number).toBe('01');
    random.mockReturnValue(0.999);
    store.state.set('ready');
    store.release();
    store.elapsed.set(1000);
    store.press();
    expect(store.currentDrillCase().number).toBe('41');
    store.retryCompletedSolve();
    expect(store.currentDrillCase()).toEqual(f2lCaseForSlot(F2L_CASES[0], 'BL'));
    expect(store.scramble()).toBe(f2lCaseForSlot(F2L_CASES[0], 'BL').setup);
    store.state.set('ready');
    store.release();
    store.press();
    expect(store.completedSolve()).toMatchObject({ caseId: 'F2L-01', f2lSlot: 'BL' });
  });

  it('ケース固定と両方ランダムに対応し、実際の出題位置を保存して再計測する', () => {
    const store = TestBed.inject(TimerStore);
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    store.setCategory('f2l');
    expect(store.selectedCase()).toBe('random');
    expect(store.selectedSlot()).toBe('random');
    store.selectedCase.set(0);
    for (const [value, slot] of [
      [0, 'FR'],
      [0.25, 'FL'],
      [0.5, 'BL'],
      [0.99, 'BR'],
    ] as const) {
      random.mockReturnValue(value);
      store.newScramble();
      expect(store.currentDrillCase()).toEqual(f2lCaseForSlot(F2L_CASES[0], slot));
    }
    store.selectedCase.set('random');
    random.mockReturnValueOnce(0.999).mockReturnValueOnce(0.25);
    store.newScramble();
    expect(store.currentDrillCase()).toEqual(f2lCaseForSlot(F2L_CASES[40], 'FL'));
    store.state.set('ready');
    store.release();
    store.elapsed.set(1200);
    store.press();
    expect(store.completedSolve()).toMatchObject({
      caseName: '41',
      caseId: 'F2L-41',
      f2lSlot: 'FL',
    });
    store.retryCompletedSolve();
    expect(store.selectedSlot()).toBe('FL');
    expect(store.scramble()).toBe(f2lCaseForSlot(F2L_CASES[40], 'FL').setup);
  });

  it('履歴の再計測では表示番号より固定IDを優先し、ケース・位置・スクランブルを復元する', () => {
    const cube = TestBed.inject(CubeService);
    const scramble = f2lCaseForSlot(F2L_CASES[40], 'BR').setup;
    const solve = cube.addSolve(1000, scramble, 'f2l', 'old-number', {
      caseId: 'F2L-41',
      f2lSlot: 'BR',
    });
    cube.prepareRetry(solve);
    const store = TestBed.inject(TimerStore);
    expect(store.category()).toBe('f2l');
    expect(store.selectedCase()).toBe(40);
    expect(store.selectedSlot()).toBe('BR');
    expect(store.scramble()).toBe(scramble);
    expect(store.currentDrillCase()).toEqual(f2lCaseForSlot(F2L_CASES[40], 'BR'));
  });
});
