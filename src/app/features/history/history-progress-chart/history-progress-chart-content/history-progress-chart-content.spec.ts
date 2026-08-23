import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../../../core/cube';
import { HistoryStore } from '../../history.store';
import { HistoryProgressChartStore } from '../history-progress-chart.store';
import { HistoryProgressChartContent } from './history-progress-chart-content';

describe('HistoryProgressChartContent', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HistoryProgressChartContent],
      providers: [HistoryStore, HistoryProgressChartStore],
    }).compileComponents();
  });

  it('Storeの集計値から4系列と右端の時間目盛りを描画する', async () => {
    const cube = TestBed.inject(CubeService);
    for (let index = 0; index < 12; index += 1) cube.addSolve(12000 - index * 500, 'R U', 'full');
    const fixture = TestBed.createComponent(HistoryProgressChartContent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.series-line')).toHaveLength(4);
    expect(fixture.nativeElement.querySelectorAll('[data-series="result"]')).toHaveLength(12);
    expect(fixture.nativeElement.querySelectorAll('.axis-label')).toHaveLength(5);
  });
});
