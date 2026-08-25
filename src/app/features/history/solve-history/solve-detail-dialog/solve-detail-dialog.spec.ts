import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { SolveDetailDialog } from './solve-detail-dialog';

describe('SolveDetailDialog', () => {
  /** 詳細表示に使用するテスト用計測記録。 */
  const solve: Solve = {
    id: 'solve-1',
    time: 1234,
    scramble: 'R U F',
    date: new Date(0).toISOString(),
    category: 'full',
    groupId: 'unclassified',
    penalty: 'none',
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SolveDetailDialog],
      providers: [
        provideRouter([]),
        { provide: MAT_DIALOG_DATA, useValue: { solve, recordNumber: 1234 } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('スクランブルと展開図を含む記録詳細を表示する', () => {
    TestBed.inject(CubeService).solves.set([solve]);
    TestBed.inject(TranslocoService).setActiveLang('en');
    const fixture = TestBed.createComponent(SolveDetailDialog);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('code').textContent).toContain('R U F');
    expect(fixture.nativeElement.querySelector('app-solve-pattern')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.solve-actions app-solve-actions')).toBeTruthy();
    const actions = fixture.nativeElement.querySelector('.solve-actions') as HTMLElement;
    expect(actions.textContent).toContain('Retry');
    expect(actions.querySelector('.compact-action.row-retry')?.getAttribute('aria-label')).toBe(
      'Retry',
    );
    expect(actions.querySelector('.compact-action.row-delete')?.getAttribute('aria-label')).toBe(
      'Delete',
    );
    expect(fixture.nativeElement.querySelector('mat-dialog-actions app-solve-actions')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('mat-dialog-actions button')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.record-number').textContent).toContain('1234');
    expect(fixture.nativeElement.textContent).toContain('1.23');

    (fixture.nativeElement.querySelector('app-solve-actions button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.result').textContent).toContain('3.23');
  });

  it('言語切替後に計測日時のロケールを更新する', () => {
    TestBed.inject(CubeService).solves.set([solve]);
    const i18n = TestBed.inject(TranslocoService);
    i18n.setActiveLang('en');
    const fixture = TestBed.createComponent(SolveDetailDialog);
    fixture.detectChanges();
    const date = fixture.nativeElement.querySelector('.recorded-date') as HTMLElement;
    const englishDate = date.textContent;

    i18n.setActiveLang('ja');
    fixture.detectChanges();

    expect(date.textContent).not.toBe(englishDate);
    expect(date.textContent).toContain('1970');
  });
});
