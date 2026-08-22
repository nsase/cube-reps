import { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CubeService } from '../../../core/cube';
import { Solve } from '../../../core/cube.models';
import { TimerStats } from './timer-stats';

describe('TimerStats', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TimerStats],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  /** TimerStatsに表示されているベスト・Mean・各AOの値を返す。 */
  function displayedValues(fixture: ComponentFixture<TimerStats>): Array<string | null> {
    return Array.from(
      fixture.nativeElement.querySelectorAll('div strong') as NodeListOf<HTMLElement>,
      (element) => element.textContent,
    );
  }

  it('現在のカテゴリーのベスト、DNFを除外した平均、件数不足のAOを表示する', async () => {
    const cube = TestBed.inject(CubeService);
    const solves: Solve[] = [
      {
        id: '1',
        time: 1000,
        scramble: 'R U',
        date: new Date(1).toISOString(),
        category: 'full',
        groupId: 'unclassified',
        penalty: '+2',
      },
      {
        id: '2',
        time: 2000,
        scramble: 'U R',
        date: new Date(2).toISOString(),
        category: 'full',
        groupId: 'unclassified',
        penalty: 'none',
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
    const fixture = TestBed.createComponent(TimerStats);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(displayedValues(fixture)).toEqual(['2.00', '2.50', '—', '—', '—', '—']);
  });

  it('solveカテゴリーの変更に合わせて集計表示を分離する', async () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set([
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
        time: 4000,
        scramble: 'U R',
        date: new Date(2).toISOString(),
        category: 'pll',
        groupId: 'unclassified',
        penalty: 'none',
      },
    ]);
    const fixture = TestBed.createComponent(TimerStats);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(displayedValues(fixture)).toEqual(['1.00', '1.00', '—', '—', '—', '—']);

    cube.activeSolveCategory.set('pll');
    fixture.detectChanges();

    expect(displayedValues(fixture)).toEqual(['4.00', '4.00', '—', '—', '—', '—']);
  });

  it('記録先カテゴリーの変更に合わせて集計表示を更新する', async () => {
    const cube = TestBed.inject(CubeService);
    const group = cube.addGroup('大会')!;
    cube.solves.set([
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
        time: 4000,
        scramble: 'U R',
        date: new Date(2).toISOString(),
        category: 'full',
        groupId: group.id,
        penalty: 'none',
      },
    ]);
    cube.activeGroupId.set('unclassified');
    const fixture = TestBed.createComponent(TimerStats);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(displayedValues(fixture)).toEqual(['1.00', '1.00', '—', '—', '—', '—']);

    cube.activeGroupId.set(group.id);
    fixture.detectChanges();

    expect(displayedValues(fixture)).toEqual(['4.00', '4.00', '—', '—', '—', '—']);
  });
});
