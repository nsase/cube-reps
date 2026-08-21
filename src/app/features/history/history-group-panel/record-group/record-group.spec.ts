import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CubeService } from '../../../../core/cube';
import { DialogButtons } from '../../../../shared/confirm-dialog/confirm-dialog.buttons';
import { HistoryStore } from '../../history.store';
import { RecordGroup } from './record-group';

describe('RecordGroup', () => {
  /** 削除選択を返すMatDialogのテスト用代替。 */
  const dialog = {
    open: vi.fn(() => ({ afterClosed: () => of(DialogButtons.delete.id) })),
  };

  beforeEach(async () => {
    localStorage.clear();
    dialog.open.mockClear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RecordGroup],
      providers: [HistoryStore, { provide: MatDialog, useValue: dialog }],
    }).compileComponents();
  });

  it('クリックしたカテゴリーを履歴の絞り込み対象にする', () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('練習')!;
    const fixture = TestBed.createComponent(RecordGroup);
    fixture.componentRef.setInput('group', group);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.group-main') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(TestBed.inject(HistoryStore).selectedGroup()).toBe(group.id);
    expect(fixture.nativeElement.classList.contains('active')).toBe(true);
  });

  it('削除確認後にカテゴリーを削除し、絞り込みをallへ戻す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    const group = cube.addGroup('削除対象')!;
    store.selectedGroup.set(group.id);
    const fixture = TestBed.createComponent(RecordGroup);
    fixture.componentRef.setInput('group', group);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.group-delete') as HTMLButtonElement).click();

    expect(dialog.open).toHaveBeenCalledOnce();
    expect(cube.groups().some(({ id }) => id === group.id)).toBe(false);
    expect(store.selectedGroup()).toBe('all');
  });
});
