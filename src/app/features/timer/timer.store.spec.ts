import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../core/cube';
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
    expect(cube.solves()[0].mode).toBe('3x3');
  });

  it('PLLモードでは選択中のケース番号を記録へ保存する', () => {
    const store = TestBed.inject(TimerStore);
    const cube = TestBed.inject(CubeService);
    store.setMode('PLL');
    store.selectedCase.set(0);

    store.press();
    store.release();
    store.elapsed.set(2000);
    store.press();

    expect(cube.solves()[0].mode).toBe('PLL');
    expect(cube.solves()[0].caseName).toBe(store.pllCases[0].number);
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
