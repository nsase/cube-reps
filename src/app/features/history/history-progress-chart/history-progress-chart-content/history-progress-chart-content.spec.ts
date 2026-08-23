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

  afterEach(() => vi.restoreAllMocks());

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

  it('1件の場合は右端へ配置して下部目盛りを表示しない', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    TestBed.inject(CubeService).addSolve(10000, 'R U', 'full');
    const fixture = TestBed.createComponent(HistoryProgressChartContent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const point = fixture.nativeElement.querySelector('[data-series="result"]') as SVGCircleElement;
    expect(point.getAttribute('cx')).toBe('888');
    expect(fixture.nativeElement.querySelector('.point-label')).toBeNull();
  });

  it('2件の場合は左端と右端へ配置する', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    const cube = TestBed.inject(CubeService);
    cube.addSolve(10000, 'R U', 'full');
    cube.addSolve(9000, 'R U', 'full');
    const fixture = TestBed.createComponent(HistoryProgressChartContent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const points = fixture.nativeElement.querySelectorAll(
      '[data-series="result"]',
    ) as NodeListOf<SVGCircleElement>;
    expect(points[0].getAttribute('cx')).toBe('32');
    expect(points[1].getAttribute('cx')).toBe('888');
  });

  it('3件以上の場合は表示領域へ均等に配置する', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    const cube = TestBed.inject(CubeService);
    for (let index = 0; index < 5; index += 1) {
      cube.addSolve(10000 - index * 500, 'R U', 'full');
    }
    const fixture = TestBed.createComponent(HistoryProgressChartContent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const points = fixture.nativeElement.querySelectorAll(
      '[data-series="result"]',
    ) as NodeListOf<SVGCircleElement>;
    const positions = Array.from(points, (point) => Number(point.getAttribute('cx')));
    expect(positions[0]).toBe(32);
    expect(positions[4]).toBe(888);
    expect(positions[1] - positions[0]).toBe(positions[4] - positions[3]);
  });

  it('100件の場合もSVGを広げず選択期間の全記録を表示する', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    const cube = TestBed.inject(CubeService);
    for (let index = 0; index < 100; index += 1) {
      cube.addSolve(100000 - index * 500, 'R U', 'full');
    }
    const fixture = TestBed.createComponent(HistoryProgressChartContent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const plot = fixture.nativeElement.querySelector('.plot') as SVGElement;
    const points = fixture.nativeElement.querySelectorAll(
      '[data-series="result"]',
    ) as NodeListOf<SVGCircleElement>;
    expect(plot.style.width).toBe('1000px');
    expect(plot.getAttribute('viewBox')).toBe('0 0 1000 240');
    expect(points).toHaveLength(100);
    expect(points[0].getAttribute('cx')).toBe('32');
    expect(points[99].getAttribute('cx')).toBe('888');
  });
});
