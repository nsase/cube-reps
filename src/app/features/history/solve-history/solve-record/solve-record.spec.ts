import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
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
    await TestBed.inject(CubeService).ready;
  });

  /** 計測記録を作成して行コンポーネントへ設定する。 */
  function createFixture() {
    const cube = TestBed.inject(CubeService);
    cube.addSolve(1234, 'R U', 'full');
    const solve = { ...cube.activeSolves()[0], createdAt: '2026-08-24T09:28:00.000Z' };
    cube.storedSolves.set([solve]);
    const fixture = TestBed.createComponent(SolveRecord);
    fixture.componentRef.setInput('solve', solve);
    fixture.componentRef.setInput('recordNumber', 1);
    fixture.componentRef.setInput('ao5', 2000);
    fixture.componentRef.setInput('ao12', 3000);
    fixture.detectChanges();
    return { cube, fixture, solve };
  }

  it('ヘッダーに対応する値だけを表示し、スクランブルは詳細ダイアログで開く', () => {
    const { fixture, solve } = createFixture();

    expect(fixture.nativeElement.querySelector('.ao5').textContent).toContain('2.00');
    expect(fixture.nativeElement.querySelector('.ao12').textContent).toContain('3.00');
    expect(fixture.nativeElement.textContent).not.toContain('Ao5');
    expect(fixture.nativeElement.textContent).not.toContain('フルソルブ');
    expect(fixture.nativeElement.querySelector('time')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('code')).toBeNull();
    (fixture.nativeElement.querySelector('.row-details') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledWith(SolveDetailDialog, {
      data: { solve, recordNumber: 1 },
    });
  });

  it('選択不可でもチェック欄を表示し、選択可能な行だけ変更を通知する', () => {
    const { fixture } = createFixture();
    const changed = vi.fn();
    fixture.componentInstance.selectionChanged.subscribe(changed);
    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
    checkbox.click();
    expect(changed).not.toHaveBeenCalled();
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
    expect(fixture.nativeElement.querySelectorAll('app-owner-avatar')).toHaveLength(1);
    checkbox.click();
    expect(changed).toHaveBeenCalledOnce();
  });

  it('言語に応じて年なしの短い計測日時を表示する', () => {
    const i18n = TestBed.inject(TranslocoService);
    i18n.setActiveLang('en');
    const { fixture } = createFixture();
    const date = fixture.nativeElement.querySelector('time') as HTMLElement;
    expect(date.textContent).toBe('Aug 24, 09:28');

    i18n.setActiveLang('ja');
    fixture.detectChanges();

    expect(date.textContent).toBe('08/24 09:28');
  });
});
