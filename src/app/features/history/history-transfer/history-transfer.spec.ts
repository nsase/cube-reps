import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import en from '../../../../../public/assets/i18n/en.json';
import ja from '../../../../../public/assets/i18n/ja.json';
import { AuthService } from '../../../core/auth/auth.service';
import { CubeService } from '../../../core/cube/cube';
import { HistoryStore } from '../history.store';
import { HistoryTransfer } from './history-transfer';

describe('HistoryTransfer', () => {
  it('選択件数と所有者を確認し、キャンセルでは変更せず確定後は移行して選択を解除する', async () => {
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
    expect(store.selectedIds().size).toBe(0);
    expect(cube.activeSolves()[0].ownerId).toBe('target');
    expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});

/** 一括移行の対象範囲と、確認操作による実行条件を検証する。 */
describe('HistoryTransfer move all', () => {
  it('未選択・絞り込み外・別ページのゲストだけを確認後に移行し、言語切替にも追従する', async () => {
    const result = new Subject<string>();
    const dialog = { open: vi.fn(() => ({ afterClosed: () => result })) };
    TestBed.configureTestingModule({
      providers: [HistoryStore, { provide: MatDialog, useValue: dialog }],
    });
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const base = cube.addSolve(1000, 'R', 'full');
    const guests = Array.from({ length: 102 }, (_, index) => ({
      ...base,
      id: `guest-${index}`,
      groupId: index === 101 ? 'other-group' : 'unclassified',
      category: index === 100 ? ('oll' as const) : ('full' as const),
    }));
    const deleted = { ...base, id: 'deleted', deletedAt: '2026-01-01T00:00:00.000Z' };
    const other = { ...base, id: 'other', ownerType: 'account' as const, ownerId: 'other' };
    cube.storedSolves.set([...guests, deleted, other]);
    const auth = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(HistoryTransfer);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="history-move-all"]')).toBeNull();
    auth.user.set({ uid: 'target', displayName: 'Destination', email: null, photoURL: null });
    fixture.detectChanges();
    expect(dialog.open).not.toHaveBeenCalled();
    const store = TestBed.inject(HistoryStore);
    store.selectedOwner.set('account:other');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      '[data-testid="history-move-all"]',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain(en.ownership.moveAll);
    expect(Object.keys(en.ownership).sort()).toEqual(Object.keys(ja.ownership).sort());
    TestBed.inject(TranslocoService).setActiveLang('ja');
    fixture.detectChanges();
    expect(button.textContent).toContain(ja.ownership.moveAll);
    button.click();
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({
          message: expect.stringContaining('102'),
          defaultFocus: 'cancel',
        }),
      }),
    );
    result.next('cancel');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(cube.guestSolves()).toHaveLength(102);
    button.click();
    result.next('move');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(cube.guestSolves()).toHaveLength(0);
    expect(button.disabled).toBe(true);
    expect(cube.storedSolves().filter((solve) => solve.ownerId === 'target')).toHaveLength(102);
    expect(cube.storedSolves()).toContainEqual(deleted);
    expect(cube.storedSolves()).toContainEqual(other);
  });

  it('確認中にアカウントが変わった場合は全件移行を開始しない', async () => {
    const result = new Subject<string>();
    TestBed.configureTestingModule({
      providers: [
        HistoryStore,
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => result }) },
        },
      ],
    });
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    cube.addSolve(1000, 'R', 'full');
    const auth = TestBed.inject(AuthService);
    auth.user.set({ uid: 'target', displayName: null, email: null, photoURL: null });
    const fixture = TestBed.createComponent(HistoryTransfer);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="history-move-all"]').click();
    auth.user.set(null);
    result.next('move');
    await fixture.whenStable();
    expect(cube.guestSolves()).toHaveLength(1);
  });
});
