import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CubeService } from '../../../core/cube';
import { DialogButtons } from '../../../shared/confirm-dialog/confirm-dialog.buttons';
import { TimerStore } from '../timer.store';
import { TimerSolveActions } from './timer-solve-actions';

describe('TimerSolveActions', () => {
  /** 削除選択を返すMatDialogのテスト用代替。 */
  const dialog = {
    open: vi.fn(() => ({ afterClosed: () => of(DialogButtons.delete.id) })),
  };

  beforeEach(async () => {
    localStorage.clear();
    dialog.open.mockClear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TimerSolveActions],
      providers: [TimerStore, { provide: MatDialog, useValue: dialog }],
    }).compileComponents();
  });

  afterEach(() => TestBed.inject(TimerStore).ngOnDestroy());

  /** 完了済み記録を設定したコンポーネントを作成する。 */
  function createFixture() {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(TimerStore);
    const solve = cube.addSolve(1234, 'R U', 'full');
    store.completedSolve.set(solve);
    const fixture = TestBed.createComponent(TimerSolveActions);
    fixture.detectChanges();
    return { cube, fixture, solve, store };
  }

  it('DNFと+2を直前の記録へ切り替えて適用する', () => {
    const { cube, fixture, solve } = createFixture();

    (fixture.nativeElement.querySelector('[data-action="dnf"]') as HTMLButtonElement).click();
    expect(cube.solves()[0].penalty).toBe('DNF');
    (fixture.nativeElement.querySelector('[data-action="plus-two"]') as HTMLButtonElement).click();
    expect(cube.solves()[0].penalty).toBe('+2');
    expect(cube.solves()[0].id).toBe(solve.id);
  });

  it('操作後にボタンからフォーカスを外す', () => {
    const { fixture } = createFixture();
    const button = fixture.nativeElement.querySelector(
      '[data-action="dnf"]',
    ) as HTMLButtonElement;
    button.focus();

    button.click();

    expect(document.activeElement).not.toBe(button);
  });

  it('削除確認後に直前の記録を削除する', () => {
    const { cube, fixture } = createFixture();

    (fixture.nativeElement.querySelector('[data-action="delete"]') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledOnce();
    expect(cube.solves()).toHaveLength(0);
  });

  it('リトライで記録を残して同じスクランブルを再設定する', () => {
    const { cube, fixture, store } = createFixture();

    (fixture.nativeElement.querySelector('[data-action="retry"]') as HTMLButtonElement).click();

    expect(cube.solves()).toHaveLength(1);
    expect(store.scramble()).toBe('R U');
    expect(store.completedSolve()).toBeUndefined();
  });
});
