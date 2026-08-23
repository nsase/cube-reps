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
    vi.spyOn(CubeService.prototype, 'createScramble').mockResolvedValue('R U');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [TimerStore] });
  });

  afterEach(() => {
    TestBed.inject(TimerStore).ngOnDestroy();
    vi.restoreAllMocks();
  });

  it('random-state scrambleの生成完了後に計測を開始できる', async () => {
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);
    expect(store.scrambleGenerating()).toBe(true);
    store.press();
    expect(store.state()).toBe('idle');

    await vi.waitFor(() => expect(store.scramble()).toBe('R U'));

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
    expect(cube.createScramble).toHaveBeenCalledTimes(2);
  });

  it('スクランブル生成に失敗した場合は計測を開始しない', async () => {
    vi.mocked(CubeService.prototype.createScramble).mockRejectedValueOnce(new Error('failed'));
    const store = TestBed.inject(TimerStore);

    await vi.waitFor(() => expect(store.scrambleGenerationFailed()).toBe(true));
    store.press();

    expect(store.state()).toBe('idle');
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
    expect(cube.solves()[0].caseName).toBe(store.drillCases()[0].number);
  });

  it('PLLケースは一覧の先頭を初期選択する', () => {
    const store = TestBed.inject(TimerStore);

    expect(store.selectedCase()).toBe(0);
    expect(store.drillCases()[store.selectedCase()].number).toBe('Aa');
  });

  it('PLLモードでは選択ケースの代表手順を反転した固定スクランブルを使う', () => {
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');

    expect(store.scramble()).toBe(
      invertAlgorithm(store.drillCases()[store.selectedCase()].algorithms[0]),
    );

    store.selectedCase.set(0);
    store.newScramble();
    const scramble = store.scramble();
    store.newScramble();

    expect(scramble).toBe(invertAlgorithm(store.drillCases()[0].algorithms[0]));
    expect(store.scramble()).toBe(scramble);
  });

  it('PLLの固定スクランブルは全ケースで代表手順により完成状態へ戻る', () => {
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');
    const solvedPattern = topLayerPatternFromScramble('');

    for (const item of store.drillCases()) {
      store.selectedCase.set(store.drillCases().indexOf(item));
      store.newScramble();
      const scrambledPattern = topLayerPatternFromScramble(store.scramble());
      expect
        .soft(topLayerPatternAfterAlgorithm(scrambledPattern, item.algorithms[0]), item.number)
        .toEqual(solvedPattern);
    }
  });

  it('OLLモードでは先頭ケースの固定スクランブルとケース番号を記録する', () => {
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);
    store.setCategory('oll');
    const item = store.drillCases()[0];

    expect(item.number).toBe('01');
    expect(store.scramble()).toBe(invertAlgorithm(item.algorithms[0]));

    store.press();
    store.release();
    store.elapsed.set(1500);
    store.press();

    expect(cube.solves()[0].category).toBe('oll');
    expect(cube.solves()[0].caseName).toBe('01');
  });

  it('OLLの固定スクランブルは全ケースで代表手順により完成状態へ戻る', () => {
    const store = TestBed.inject(TimerStore);
    store.setCategory('oll');
    const solvedPattern = topLayerPatternFromScramble('');

    for (const item of store.drillCases()) {
      store.selectedCase.set(store.drillCases().indexOf(item));
      store.newScramble();
      const scrambledPattern = topLayerPatternFromScramble(store.scramble());
      expect
        .soft(topLayerPatternAfterAlgorithm(scrambledPattern, item.algorithms[0]), item.number)
        .toEqual(solvedPattern);
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
