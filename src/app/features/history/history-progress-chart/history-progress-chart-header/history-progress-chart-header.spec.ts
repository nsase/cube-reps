import { TestBed } from '@angular/core/testing';
import { HistoryStore } from '../../history.store';
import { HistoryProgressChartStore } from '../history-progress-chart.store';
import { HistoryProgressChartHeader } from './history-progress-chart-header';

describe('HistoryProgressChartHeader', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HistoryProgressChartHeader],
      providers: [HistoryStore, HistoryProgressChartStore],
    }).compileComponents();
  });

  it('表示範囲と系列の凡例を表示し、選択値をStoreへ反映する', async () => {
    const fixture = TestBed.createComponent(HistoryProgressChartHeader);
    fixture.detectChanges();
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.options).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('.legend li')).toHaveLength(4);

    select.selectedIndex = 0;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(TestBed.inject(HistoryProgressChartStore).displayRange()).toBe(50);
  });
});
