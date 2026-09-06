import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import en from '../../../../../public/assets/i18n/en.json';
import ja from '../../../../../public/assets/i18n/ja.json';
import { CubeService } from '../../../core/cube';
import { HistoryStore } from '../history.store';
import { HistoryFilter } from './history-filter';

describe('HistoryFilter', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HistoryFilter],
      providers: [HistoryStore],
    }).compileComponents();
  });

  it('カテゴリーと記録グループを切り替えて共有Storeへ反映する', async () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('大会')!;
    const fixture = TestBed.createComponent(HistoryFilter);
    fixture.detectChanges();
    await fixture.whenStable();

    const selects = fixture.nativeElement.querySelectorAll(
      'select',
    ) as NodeListOf<HTMLSelectElement>;
    const categorySelect = selects[0];
    const groupSelect = selects[1];
    expect(Array.from(groupSelect.options, (option) => option.value)).toEqual([
      'unclassified',
      group.id,
    ]);

    categorySelect.value = 'oll';
    categorySelect.dispatchEvent(new Event('change'));
    groupSelect.value = group.id;
    groupSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    const store = TestBed.inject(HistoryStore);
    expect(store.selectedCategory()).toBe('oll');
    expect(store.selectedGroup()).toBe(group.id);
  });
  it('全言語に所有者キーがあり、表示中の所有者選択肢を言語変更に追従させる', async () => {
    expect(Object.keys(en.ownership).sort()).toEqual(Object.keys(ja.ownership).sort());
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const guest = cube.addSolve(1000, 'R', 'full');
    cube.storedSolves.set([
      guest,
      { ...guest, id: 'unknown-account', ownerType: 'account', ownerId: 'other' },
    ]);
    const fixture = TestBed.createComponent(HistoryFilter);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector(
      '[data-testid="history-owner-filter"]',
    ) as HTMLSelectElement;
    expect(select.textContent).toContain('Not linked to an account');
    select.value = 'account:other';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(
      TestBed.inject(HistoryStore)
        .filteredSolves()
        .map((solve) => solve.id),
    ).toEqual(['unknown-account']);
    TestBed.inject(TranslocoService).setActiveLang('ja');
    fixture.detectChanges();
    expect(select.textContent).toContain('アカウント未紐づけ');
    expect(select.textContent).toContain('アカウント (other)');
  });
});
