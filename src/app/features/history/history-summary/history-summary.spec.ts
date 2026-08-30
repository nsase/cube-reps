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

  it('+2を反映してDNFを除外したベストと平均、件数不足のAOを表示する', async () => {
    const cube = TestBed.inject(CubeService);
    const solves: Solve[] = [
      {
        id: '1',
        time: 1000,
        scramble: 'R U',
        date: new Date(1).toISOString(),
        updatedAt: new Date(1).toISOString(),
        ownerType: 'guest',
        ownerId: 'guest-test',
        schemaVersion: 1,
        category: 'full',
        groupId: 'unclassified',
        penalty: 'none',
      },
      {
        id: '2',
        time: 2000,
        scramble: 'U R',
        date: new Date(2).toISOString(),
        updatedAt: new Date(2).toISOString(),
        ownerType: 'guest',
        ownerId: 'guest-test',
        schemaVersion: 1,
        category: 'full',
        groupId: 'unclassified',
        penalty: '+2',
      },
      {
        id: '3',
        time: 500,
        scramble: 'F R',
        date: new Date(3).toISOString(),
        updatedAt: new Date(3).toISOString(),
        ownerType: 'guest',
        ownerId: 'guest-test',
        schemaVersion: 1,
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
