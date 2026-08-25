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

  it('プルダウンでカテゴリーを切り替え、対象記録のベストを更新する', async () => {
    const cube = TestBed.inject(CubeService);
    cube.addSolve(1000, 'R U', 'full');
    const group = cube.addGroup('大会')!;
    cube.addSolve(2000, 'U R', 'full');
    const fixture = TestBed.createComponent(HistorySummary);
    fixture.detectChanges();
    await fixture.whenStable();

    const select = fixture.nativeElement.querySelectorAll('select')[1] as HTMLSelectElement;
    expect(Array.from(select.options, (option) => option.value)).toEqual([
      'unclassified',
      group.id,
    ]);
    select.value = group.id;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(TestBed.inject(HistoryStore).selectedGroup()).toBe(group.id);
    expect(cube.activeGroupId()).toBe(group.id);
    expect(fixture.nativeElement.querySelector('.summaries article strong')?.textContent).toBe(
      '2.00',
    );
  });

  it('+2を反映してDNFを除外したベストと平均、件数不足のAOを表示する', async () => {
    const cube = TestBed.inject(CubeService);
    const solves: Solve[] = [
      {
        id: '1',
        time: 1000,
        scramble: 'R U',
        date: new Date(1).toISOString(),
        category: 'full',
        groupId: 'unclassified',
        penalty: 'none',
      },
      {
        id: '2',
        time: 2000,
        scramble: 'U R',
        date: new Date(2).toISOString(),
        category: 'full',
        groupId: 'unclassified',
        penalty: '+2',
      },
      {
        id: '3',
        time: 500,
        scramble: 'F R',
        date: new Date(3).toISOString(),
        category: 'full',
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
    expect(values).toEqual(['1.00', '2.50', '—', '—', '—', '—']);
  });

  it('英語では平均のラベルをMeanと表示する', async () => {
    const fixture = TestBed.createComponent(HistorySummary);
    fixture.detectChanges();
    await fixture.whenStable();

    const articles = fixture.nativeElement.querySelectorAll(
      '.summaries article',
    ) as NodeListOf<HTMLElement>;
    expect(articles[1]?.textContent?.trim()).toBe('Mean—');
    expect(Array.from(articles, (article) => article.textContent?.trim()).slice(2)).toEqual([
      'Ao5—',
      'Ao12—',
      'Ao50—',
      'Ao100—',
    ]);
  });
});
