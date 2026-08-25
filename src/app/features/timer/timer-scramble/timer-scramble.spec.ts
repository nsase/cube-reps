import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TimerStore } from '../timer.store';
import { TimerScramble } from './timer-scramble';

describe('TimerScramble', () => {
  /** スクランブル表示に必要な状態だけを持つTimerStoreのテスト用代替。 */
  const store = {
    category: signal<'full' | 'oll' | 'pll'>('full'),
    selectedCase: signal<number | 'random'>('random'),
    scramble: signal('R U'),
    scrambleGenerating: signal(false),
    scrambleGenerationFailed: signal(false),
    newScramble: vi.fn(),
  };

  beforeEach(async () => {
    store.category.set('full');
    store.selectedCase.set('random');
    store.newScramble.mockClear();
    await TestBed.configureTestingModule({
      imports: [TimerScramble],
      providers: [{ provide: TimerStore, useValue: store }],
    }).compileComponents();
  });

  it('再作成後にボタンからフォーカスを外す', () => {
    const fixture = TestBed.createComponent(TimerScramble);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.focus();

    button.click();

    expect(store.newScramble).toHaveBeenCalledOnce();
    expect(document.activeElement).not.toBe(button);
  });

  it('ランダムドリルではケースを選び直すボタンを表示する', () => {
    store.category.set('pll');
    store.selectedCase.set('random');
    const fixture = TestBed.createComponent(TimerScramble);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    button.click();

    expect(store.newScramble).toHaveBeenCalledOnce();
  });

  it('固定ケースのドリルではケースを選び直すボタンを表示しない', () => {
    store.category.set('oll');
    store.selectedCase.set(0);
    const fixture = TestBed.createComponent(TimerScramble);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
