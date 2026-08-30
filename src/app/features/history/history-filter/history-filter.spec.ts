import { TestBed } from '@angular/core/testing';
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
});
