import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { CubeService } from '../../../core/cube';
import { Solve } from '../../../core/cube.models';
import { HistoryStore } from '../history.store';
import { HistoryProgressChart } from './history-progress-chart';

describe('HistoryProgressChart', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HistoryProgressChart],
      providers: [HistoryStore],
    }).compileComponents();
  });

  it('記録を古い順に並べ、各時点の結果、ベスト、AO5、AO12を表示する', async () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set(
      createSolves([12000, 11000, 10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000]),
    );
    const fixture = TestBed.createComponent(HistoryProgressChart);
    fixture.detectChanges();
    await fixture.whenStable();
    const resultPoints = fixture.nativeElement.querySelectorAll(
      '[data-series="result"]',
    ) as NodeListOf<SVGCircleElement>;
    expect(resultPoints).toHaveLength(12);
    expect(resultPoints[0].querySelector('title')?.textContent).toContain('1.00');
    expect(
      fixture.nativeElement.querySelector('[data-series="best"][data-point="5"] title')
        ?.textContent,
    ).toContain('1.00');
    expect(
      fixture.nativeElement.querySelector('[data-series="ao5"][data-point="5"] title')?.textContent,
    ).toContain('3.00');
    const ao12Points = fixture.nativeElement.querySelectorAll(
      '[data-series="ao12"]',
    ) as NodeListOf<SVGCircleElement>;
    expect(ao12Points).toHaveLength(1);
    expect(ao12Points[0].querySelector('title')?.textContent).toContain('6.50');
    expect(fixture.nativeElement.querySelectorAll('.series-line')).toHaveLength(4);
    const axisLabels = fixture.nativeElement.querySelectorAll(
      '.axis-label',
    ) as NodeListOf<SVGTextElement>;
    expect(axisLabels).toHaveLength(5);
    expect(axisLabels[0].textContent).toContain('12.88');
    expect(axisLabels[4].textContent).toContain('0.12');
    expect(resultPoints[0].getAttribute('cx')).toBe('32');
    expect(resultPoints[11].getAttribute('cx')).toBe('736');
  });

  it('直近100回を初期表示し、50回とすべてへ表示範囲を切り替える', async () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set(createSolves(Array.from({ length: 120 }, (_, index) => 120000 - index * 1000)));
    const fixture = TestBed.createComponent(HistoryProgressChart);
    fixture.detectChanges();
    await fixture.whenStable();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    let resultPoints = fixture.nativeElement.querySelectorAll(
      '[data-series="result"]',
    ) as NodeListOf<SVGCircleElement>;
    expect(resultPoints).toHaveLength(100);
    expect(resultPoints[0].dataset['point']).toBe('21');

    select.selectedIndex = 0;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    resultPoints = fixture.nativeElement.querySelectorAll('[data-series="result"]');
    expect(resultPoints).toHaveLength(50);
    expect(resultPoints[0].dataset['point']).toBe('71');

    select.selectedIndex = 4;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[data-series="result"]')).toHaveLength(120);
  });

  it('DNFを結果では非表示にし、Averageでは最悪値として扱う', async () => {
    const cube = TestBed.inject(CubeService);
    const solves = createSolves([5000, 4000, 3000, 2000, 1000]);
    solves[0] = { ...solves[0], penalty: 'DNF' };
    cube.solves.set(solves);
    const fixture = TestBed.createComponent(HistoryProgressChart);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[data-series="result"][data-point="5"]'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-series="ao5"][data-point="5"] title')?.textContent,
    ).toContain('3.00');
  });

  it('言語切替後にタイトルと凡例を更新する', async () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set(createSolves([1000]));
    const fixture = TestBed.createComponent(HistoryProgressChart);
    fixture.detectChanges();
    await fixture.whenStable();

    const i18n = TestBed.inject(TranslocoService);
    i18n.setActiveLang('ja');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h2')?.textContent).toContain('記録の推移');
    expect(fixture.nativeElement.querySelector('option')?.textContent).toContain('直近50回');
    expect(fixture.nativeElement.querySelector('.legend')?.textContent).toContain('Ao5');
    expect(fixture.nativeElement.querySelector('.legend')?.textContent).toContain('Ao12');

    i18n.setActiveLang('en');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h2')?.textContent).toContain('SOLVE PROGRESS');
    expect(fixture.nativeElement.querySelector('option')?.textContent).toContain('Last 50');
    expect(fixture.nativeElement.querySelector('.legend')?.textContent).toContain('Ao5');
    expect(fixture.nativeElement.querySelector('.legend')?.textContent).toContain('Ao12');
  });

  it('対象記録がない場合はグラフを表示しない', () => {
    const fixture = TestBed.createComponent(HistoryProgressChart);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.progress-chart')).toBeNull();
  });
});

/** テスト用タイムを新しい順の計測記録へ変換する。 */
function createSolves(times: readonly number[]): Solve[] {
  return times.map((time, index) => ({
    id: String(index + 1),
    time,
    scramble: 'R U',
    date: new Date(times.length - index).toISOString(),
    updatedAt: new Date(times.length - index).toISOString(),
    ownerType: 'guest',
    ownerId: 'guest-test',
    schemaVersion: 1,
    category: 'full',
    groupId: 'unclassified',
    penalty: 'none',
  }));
}
