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
    Reflect.deleteProperty(navigator, 'wakeLock');
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('random-state scrambleの生成完了後に計測を開始できる', async () => {
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);
    expect(store.scrambleGenerating()).toBe(true);
    store.press();
    expect(store.state()).toBe('idle');

    await vi.waitFor(() => expect(store.scramble()).toBe('R U'));

    vi.useFakeTimers();
    store.press();
    expect(store.state()).toBe('holding');
    store.release();
    expect(store.state()).toBe('idle');

    store.press();
    vi.advanceTimersByTime(499);
    expect(store.state()).toBe('holding');
    vi.advanceTimersByTime(1);
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
    vi.useRealTimers();
  });

  it('計測中だけWake Lockを保持し、解除後に画面へ戻ると再取得する', async () => {
    const firstRelease = vi.fn().mockResolvedValue(undefined);
    const secondRelease = vi.fn().mockResolvedValue(undefined);
    const firstWakeLock = { released: false, release: firstRelease } as unknown as WakeLockSentinel;
    const secondWakeLock = {
      released: false,
      release: secondRelease,
    } as unknown as WakeLockSentinel;
    const request = vi
      .fn()
      .mockResolvedValueOnce(firstWakeLock)
      .mockResolvedValueOnce(secondWakeLock);
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });

    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');
    store.state.set('ready');
    store.release();

    await vi.waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
    await Promise.resolve();
    await Promise.resolve();

    Object.defineProperty(firstWakeLock, 'released', { value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    store.press();
    await vi.waitFor(() => expect(secondRelease).toHaveBeenCalledOnce());
    expect(store.state()).toBe('idle');
  });

  it('スクランブル生成に失敗した場合は計測を開始しない', async () => {
    vi.mocked(CubeService.prototype.createScramble).mockRejectedValueOnce(new Error('failed'));
    const store = TestBed.inject(TimerStore);

    await vi.waitFor(() => expect(store.scrambleGenerationFailed()).toBe(true));
    store.press();

    expect(store.state()).toBe('idle');
  });

  it('履歴のリトライ対象からスクランブルと計測条件を復元する', () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('Retry group')!;
    const solve = cube.addSolve(1234, 'R U F', 'pll', 'Aa');
    cube.prepareRetry(solve);

    const store = TestBed.inject(TimerStore);

    expect(store.category()).toBe('pll');
    expect(store.currentDrillCase().number).toBe('Aa');
    expect(store.scramble()).toBe('R U F');
    expect(store.scrambleGenerating()).toBe(false);
    expect(cube.activeGroupId()).toBe(group.id);
    expect(cube.createScramble).not.toHaveBeenCalled();
  });

  it('PLLのランダムモードでは出題したケース番号を記録へ保存する', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);
    store.setCategory('pll');
    const expectedCase = store.currentDrillCase().number;

    store.state.set('ready');
    store.release();
    store.elapsed.set(2000);
    store.press();

    expect(cube.solves()[0].category).toBe('pll');
    expect(cube.solves()[0].caseName).toBe(expectedCase);
  });

  it('PLLモードではランダムを初期選択する', () => {
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');

    expect(store.selectedCase()).toBe('random');
    expect(store.drillCases()).toContain(store.currentDrillCase());
  });

  it('ランダムモードではスクランブル更新ごとに出題ケースを選ぶ', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.999);
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');

    expect(store.currentDrillCase()).toBe(store.drillCases()[0]);
    expect(store.scramble()).toBe(invertAlgorithm(store.drillCases()[0].algorithms[0]));

    store.newScramble();

    expect(store.currentDrillCase()).toBe(store.drillCases().at(-1));
    expect(store.scramble()).toBe(invertAlgorithm(store.drillCases().at(-1)!.algorithms[0]));
  });

  it('PLLモードでは選択ケースの代表手順を反転した固定スクランブルを使う', () => {
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');
    store.selectedCase.set(0);
    store.newScramble();

    expect(store.scramble()).toBe(invertAlgorithm(store.currentDrillCase().algorithms[0]));

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
    store.selectedCase.set(0);
    store.newScramble();
    const item = store.drillCases()[0];

    expect(item.number).toBe('01');
    expect(store.scramble()).toBe(invertAlgorithm(item.algorithms[0]));

    store.state.set('ready');
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
  it('Spaceを規定時間長押しして離した場合だけ計測を開始する', () => {
    vi.useFakeTimers();
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');
    const keyDown = new KeyboardEvent('keydown', { code: 'Space' });
    const keyUp = new KeyboardEvent('keyup', { code: 'Space' });

    store.keyDown(keyDown);
    expect(store.state()).toBe('holding');
    store.keyUp(keyUp);
    expect(store.state()).toBe('idle');

    store.keyDown(keyDown);
    vi.advanceTimersByTime(500);
    expect(store.state()).toBe('ready');
    store.keyUp(keyUp);

    expect(store.state()).toBe('running');
    vi.useRealTimers();
  });

  it('ポインター操作が中断された場合は長押し完了後も開始しない', () => {
    vi.useFakeTimers();
    const store = TestBed.inject(TimerStore);
    store.setCategory('pll');

    store.press();
    store.cancelPress();
    vi.advanceTimersByTime(500);

    expect(store.state()).toBe('idle');
    vi.useRealTimers();
  });
});
