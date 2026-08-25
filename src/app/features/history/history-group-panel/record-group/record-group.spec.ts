import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CubeService } from '../../../../core/cube';
import { ConfirmService } from '../../../../shared/confirm-dialog/confirm.service';
import { HistoryStore } from '../../history.store';
import { RecordGroup } from './record-group';

describe('RecordGroup', () => {
  /** 削除確認済みを返すConfirmServiceのテスト用代替。 */
  const confirm = {
    delete: vi.fn(() => of(true)),
  };

  beforeEach(async () => {
    localStorage.clear();
    confirm.delete.mockClear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RecordGroup],
      providers: [HistoryStore, { provide: ConfirmService, useValue: confirm }],
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

  it('ユーザー作成カテゴリーの名前をインラインで変更する', async () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('変更前')!;
    const fixture = TestBed.createComponent(RecordGroup);
    fixture.componentRef.setInput('group', group);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.group-edit') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('.group-edit-form input') as HTMLInputElement;
    input.value = '変更後';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.group-edit-form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();

    expect(cube.groupName(group.id)).toBe('変更後');
    expect(fixture.nativeElement.querySelector('.group-edit-form')).toBeNull();
  });

  it('削除確認後にカテゴリーを削除し、既定グループへ戻す', () => {
    const cube = TestBed.inject(CubeService);
    const store = TestBed.inject(HistoryStore);
    const group = cube.addGroup('削除対象')!;
    const solve = cube.addSolve(1234, 'R U', 'full');
    store.selectedGroup.set(group.id);
    const fixture = TestBed.createComponent(RecordGroup);
    fixture.componentRef.setInput('group', group);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.group-delete') as HTMLButtonElement).click();

    expect(confirm.delete).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/1.*(?:未分類|Unclassified)/s),
    );
    expect(cube.groups().some(({ id }) => id === group.id)).toBe(false);
    expect(store.selectedGroup()).toBe('unclassified');
    expect(cube.solves().find(({ id }) => id === solve.id)?.groupId).toBe('unclassified');
  });
});
