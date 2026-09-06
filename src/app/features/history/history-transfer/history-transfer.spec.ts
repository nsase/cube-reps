import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CubeService } from '../../../core/cube';
import { HistoryStore } from '../history.store';
import { HistoryTransfer } from './history-transfer';

describe('HistoryTransfer', () => {
  it('選択件数と所有者を確認し、キャンセルでは変更せず確定後は閉じられる結果を表示する', async () => {
    const dialog = {
      open: vi.fn((_component: unknown, _config: { data: { message: string } }) => ({
        afterClosed: () => of('cancel'),
      })),
    };
    TestBed.configureTestingModule({
      providers: [HistoryStore, { provide: MatDialog, useValue: dialog }],
    });
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const solve = cube.addSolve(1000, 'R', 'full');
    TestBed.inject(AuthService).user.set({
      uid: 'target',
      displayName: 'Destination',
      email: null,
      photoURL: null,
    });
    const store = TestBed.inject(HistoryStore);
    const fixture = TestBed.createComponent(HistoryTransfer);
    fixture.detectChanges();
    store.toggleSelection(solve);
    fixture.detectChanges();
    const move = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    move.click();
    await fixture.whenStable();
    expect(cube.guestSolves()).toHaveLength(1);
    expect(dialog.open.mock.calls[0][1].data.message).toContain('1');
    expect(dialog.open.mock.calls[0][1].data.message).toContain('Destination');
    dialog.open.mockReturnValue({ afterClosed: () => of('move') });
    move.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(cube.guestSolves()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Saved: 1',
    );
    (fixture.nativeElement.querySelector('[role="status"] button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });
});
