import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../../core/cube';
import { Solve } from '../../../core/cube.models';
import { HistoryStore } from '../history.store';
import { HistorySummary } from './history-summary';

describe('HistorySummary', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HistorySummary],
      providers: [HistoryStore],
    }).compileComponents();
  });

  it('プルダウンでカテゴリーを切り替え、対象件数を更新する', async () => {
    const cube = TestBed.inject(CubeService);
    cube.addSolve(1000, 'R U', '3x3');
    const group = cube.addGroup('大会')!;
    cube.addSolve(2000, 'U R', '3x3');
    const fixture = TestBed.createComponent(HistorySummary);
    fixture.detectChanges();
    await fixture.whenStable();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = group.id;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(TestBed.inject(HistoryStore).selectedGroup()).toBe(group.id);
    expect(fixture.nativeElement.querySelector('.summaries article strong')?.textContent).toBe('1');
  });

  it('対象件数、+2を反映したベスト、DNFを除外した平均を表示する', async () => {
    const cube = TestBed.inject(CubeService);
    const solves: Solve[] = [
      {
        id: 1,
        time: 1000,
        scramble: 'R U',
        date: new Date(1).toISOString(),
        mode: '3x3',
        groupId: 'unclassified',
        penalty: 'none',
      },
      {
        id: 2,
        time: 2000,
        scramble: 'U R',
        date: new Date(2).toISOString(),
        mode: '3x3',
        groupId: 'unclassified',
        penalty: '+2',
      },
      {
        id: 3,
        time: 500,
        scramble: 'F R',
        date: new Date(3).toISOString(),
        mode: '3x3',
        groupId: 'unclassified',
        penalty: 'DNF',
      },
    ];
    cube.solves.set(solves);
    const fixture = TestBed.createComponent(HistorySummary);
    fixture.detectChanges();
    await fixture.whenStable();

    const values = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.summaries article strong',
      ) as NodeListOf<HTMLElement>,
      (element) => element.textContent,
    );
    expect(values).toEqual(['3', '1.00', '2.50']);
  });
});
