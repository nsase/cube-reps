import { TestBed } from '@angular/core/testing';
import { CubeService } from '../../../core/cube';
import { HistoryStore } from '../history.store';
import { HistoryProgressChartStore } from './history-progress-chart.store';

describe('HistoryProgressChartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [HistoryStore, HistoryProgressChartStore] });
  });

  it('全履歴で集計した結果を選択した直近件数へ絞り込む', () => {
    const cube = TestBed.inject(CubeService);
    for (let index = 0; index < 120; index += 1) cube.addSolve(120000 - index * 500, 'R U', 'full');
    const store = TestBed.inject(HistoryProgressChartStore);

    expect(store.points()).toHaveLength(100);
    expect(store.points()[0].number).toBe(21);

    store.displayRange.set(50);
    expect(store.points()).toHaveLength(50);
    expect(store.points()[0].number).toBe(71);

    store.displayRange.set('all');
    expect(store.points()).toHaveLength(120);
  });

  it('途中のDNFを飛ばして前後の有効な結果を線でつなぐ', () => {
    const cube = TestBed.inject(CubeService);
    const solves = Array.from({ length: 6 }, (_, index) =>
      cube.addSolve(10000 - index * 500, 'R U', 'full'),
    );
    cube.togglePenalty(solves[2].id, 'DNF');
    cube.togglePenalty(solves[3].id, 'DNF');
    const store = TestBed.inject(HistoryProgressChartStore);
    const chartWidth = 848;

    const path = store.linePath('result', chartWidth);

    expect(path.match(/[ML]/g)).toEqual(['M', 'L', 'L', 'L']);
    expect(path).toContain(`L ${store.xPosition(4, chartWidth)}`);
    expect(path).not.toContain(`M ${store.xPosition(4, chartWidth)}`);
  });
});
