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

  it('14件未満では間隔と文字倍率を維持して最新記録を右寄せする', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    const cube = TestBed.inject(CubeService);
    for (let index = 0; index < 5; index += 1) {
      cube.addSolve(10000 - index * 500, 'R U', 'full');
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
    expect(Number(points[0].getAttribute('cx'))).toBeGreaterThan(600);
    expect(points[4].getAttribute('cx')).toBe('888');
  });

  it('14件を超えると同じ間隔のままSVGを広げて横スクロール可能にする', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    const cube = TestBed.inject(CubeService);
    for (let index = 0; index < 20; index += 1) {
      cube.addSolve(20000 - index * 500, 'R U', 'full');
    }
    const fixture = TestBed.createComponent(HistoryProgressChartContent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const plot = fixture.nativeElement.querySelector('.plot') as SVGElement;
    const points = fixture.nativeElement.querySelectorAll(
      '[data-series="result"]',
    ) as NodeListOf<SVGCircleElement>;
    const width = Number.parseFloat(plot.style.width);
    const previousX = Number(points[18].getAttribute('cx'));
    const latestX = Number(points[19].getAttribute('cx'));
    expect(width).toBeGreaterThan(1000);
    expect(plot.getAttribute('viewBox')).toBe('0 0 ' + width + ' 240');
    expect(latestX - previousX).toBeCloseTo((1000 - 80) / 14);
  });
});
