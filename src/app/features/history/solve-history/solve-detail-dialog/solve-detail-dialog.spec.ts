import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
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
        { provide: MAT_DIALOG_DATA, useValue: solve },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('スクランブルと展開図を含む記録詳細を表示する', () => {
    TestBed.inject(CubeService).solves.set([solve]);
    const fixture = TestBed.createComponent(SolveDetailDialog);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('code').textContent).toContain('R U F');
    expect(fixture.nativeElement.querySelector('app-solve-pattern')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-solve-actions')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('1.23');

    (fixture.nativeElement.querySelector('app-solve-actions button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.result').textContent).toContain('3.23');
  });
});
