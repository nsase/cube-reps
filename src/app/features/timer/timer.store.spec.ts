import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../core/cube';
import {
  invertAlgorithm,
  topLayerPatternAfterAlgorithm,
  topLayerPatternFromScramble,
} from '../../core/cube-state';
import { TimerStore } from './timer.store';

describe('TimerStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [TimerStore] });
  });

  afterEach(() => {
    TestBed.inject(TimerStore).ngOnDestroy();
  });

  it('押下と解放で計測を開始し、再押下で記録を保存する', () => {
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);

    store.press();
    expect(store.state()).toBe('ready');
    store.release();
    expect(store.state()).toBe('running');
    store.elapsed.set(1234);
    store.press();

    expect(store.state()).toBe('idle');
    expect(cube.solves()[0].time).toBe(1234);
    expect(cube.solves()[0].category).toBe('full');
    expect(store.completedSolve()?.id).toBe(cube.solves()[0].id);
  });

  it('PLLモードでは選択中のケース番号を記録へ保存する', () => {
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);
    store.setCategory('pll');
    store.selectedCase.set(0);

    store.press();
    store.release();
    store.elapsed.set(2000);
    store.press();

    expect(cube.solves()[0].category).toBe('pll');
    expect(cube.solves()[0].caseName).toBe(store.pllCases[0].number);
  });

  it('PLLモードでは選択ケースの代表手順を反転した固定スクランブルを使う', () => {
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');

    expect(store.scramble()).toBe(
      invertAlgorithm(store.pllCases[store.selectedCase()].algorithms[0]),
    );

    store.selectedCase.set(0);
    store.newScramble();
    const scramble = store.scramble();
    store.newScramble();

    expect(scramble).toBe(invertAlgorithm(store.pllCases[0].algorithms[0]));
    expect(store.scramble()).toBe(scramble);
  });

  it('PLLの固定スクランブルは全ケースで代表手順により完成状態へ戻る', () => {
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');
    const solvedPattern = topLayerPatternFromScramble('');

    for (const item of store.pllCases) {
      store.selectedCase.set(store.pllCases.indexOf(item));
      store.newScramble();
      const scrambledPattern = topLayerPatternFromScramble(store.scramble());
      expect.soft(
        topLayerPatternAfterAlgorithm(scrambledPattern, item.algorithms[0]),
        item.number,
      ).toEqual(solvedPattern);
    }
  });

  it('入力要素上のスペースキー操作では計測状態を変更しない', () => {
    const store = TestBed.inject(TimerStore);
    const input = document.createElement('input');
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    Object.defineProperty(event, 'target', { value: input });

    store.keyDown(event);

    expect(store.state()).toBe('idle');
  });
});
