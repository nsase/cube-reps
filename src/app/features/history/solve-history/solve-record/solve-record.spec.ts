import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { CubeService } from '../../../../core/cube';
import { ConfirmService } from '../../../../shared/confirm-dialog/confirm.service';
import { SolveDetailDialog } from '../solve-detail-dialog/solve-detail-dialog';
import { SolveRecord } from './solve-record';

describe('SolveRecord', () => {
  /** 削除確認済みを返すConfirmServiceのテスト用代替。 */
  const confirm = {
    delete: vi.fn(() => of(true)),
  };
  /** 詳細ダイアログを開くMatDialogのテスト用代替。 */
  const dialog = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    localStorage.clear();
    confirm.delete.mockClear();
    dialog.open.mockClear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SolveRecord],
      providers: [
        provideRouter([]),
        { provide: ConfirmService, useValue: confirm },
        { provide: MatDialog, useValue: dialog },
      ],
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
    fixture.componentRef.setInput('ao5', 2000);
    fixture.componentRef.setInput('ao12', 3000);
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

  it('Aoと日時を一覧に表示し、スクランブルは詳細ダイアログで開く', () => {
    const { fixture, solve } = createFixture();

    expect(fixture.nativeElement.querySelector('.averages').textContent).toContain('2.00');
    expect(fixture.nativeElement.querySelector('time')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('code')).toBeNull();
    (fixture.nativeElement.querySelector('.row-details') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledWith(SolveDetailDialog, { data: solve });
  });

  it('リトライ対象を設定してタイマー画面へ移動する', () => {
    const { cube, fixture, solve } = createFixture();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    (fixture.nativeElement.querySelector('.row-retry') as HTMLButtonElement).click();

    expect(cube.takeRetrySolve()).toEqual(solve);
    expect(navigate).toHaveBeenCalledWith(['/timer']);
  });

  it('削除確認後に計測記録を削除する', () => {
    const { cube, fixture, solve } = createFixture();

    (fixture.nativeElement.querySelector('.row-delete') as HTMLButtonElement).click();

    expect(confirm.delete).toHaveBeenCalledOnce();
    expect(cube.solves().some(({ id }) => id === solve.id)).toBe(false);
  });
});
