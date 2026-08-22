import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CubeService } from '../../../../core/cube';
import { DialogButtons } from '../../../../shared/confirm-dialog/confirm-dialog.buttons';
import { SolveRecord } from './solve-record';

describe('SolveRecord', () => {
  /** 削除選択を返すMatDialogのテスト用代替。 */
  const dialog = {
    open: vi.fn(() => ({ afterClosed: () => of(DialogButtons.delete.id) })),
  };

  beforeEach(async () => {
    localStorage.clear();
    dialog.open.mockClear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SolveRecord],
      providers: [{ provide: MatDialog, useValue: dialog }],
    }).compileComponents();
  });

  /** 計測記録を作成して行コンポーネントへ設定する。 */
  function createFixture() {
    const cube = TestBed.inject(CubeService);
    cube.addSolve(1234, 'R U', 'full');
    const solve = cube.solves()[0];
    const fixture = TestBed.createComponent(SolveRecord);
    fixture.componentRef.setInput('solve', solve);
    fixture.componentRef.setInput('recordNumber', 1);
    fixture.detectChanges();
    return { cube, fixture, solve };
  }

  it('+2ボタンでペナルティの適用と解除を切り替える', () => {
    const { cube, fixture, solve } = createFixture();
    const button = fixture.nativeElement.querySelectorAll(
      '.row-actions button',
    )[0] as HTMLButtonElement;

    button.click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('+2');
    button.click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('none');
  });

  it('DNFボタンでペナルティの適用と解除を切り替える', () => {
    const { cube, fixture, solve } = createFixture();
    const button = fixture.nativeElement.querySelectorAll(
      '.row-actions button',
    )[1] as HTMLButtonElement;

    button.click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('DNF');
    button.click();
    expect(cube.solves().find(({ id }) => id === solve.id)?.penalty).toBe('none');
  });

  it('削除確認後に計測記録を削除する', () => {
    const { cube, fixture, solve } = createFixture();

    (fixture.nativeElement.querySelector('.row-delete') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledOnce();
    expect(cube.solves().some(({ id }) => id === solve.id)).toBe(false);
  });
});
