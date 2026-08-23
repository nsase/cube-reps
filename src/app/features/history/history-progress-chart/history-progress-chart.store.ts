import { computed, inject, Injectable, signal } from '@angular/core';
import { CubeService } from '../../../core/cube';
import { average } from '../../../core/cube-statistics';
import { HistoryStore } from '../history.store';

/** グラフに表示する集計系列。 */
export type ProgressSeries = 'result' | 'best' | 'ao5' | 'ao12';

/** グラフへ表示する直近記録数。 */
export type ChartRange = 50 | 100 | 500 | 1000 | 'all';

/** 1回の計測終了時点における記録と移動平均。 */
export interface ProgressPoint {
  /** 古い記録から数えた1始まりの計測番号。 */
  readonly number: number;
  /** その回のペナルティ反映済みタイム。 */
  readonly result: number;
  /** その時点までのベストタイム。 */
  readonly best: number;
  /** その回を末尾とするAo5。 */
  readonly ao5?: number;
  /** その回を末尾とするAo12。 */
  readonly ao12?: number;
}

/** 履歴グラフの表示範囲、集計値、SVG座標をチャート内で共有する。 */
@Injectable()
export class HistoryProgressChartStore {
  /** タイムの補正と表示形式を提供するサービス。 */
  private readonly cube = inject(CubeService);
  /** Historyコンポーネントツリー内で共有する画面状態。 */
  private readonly historyStore = inject(HistoryStore);
  /** グラフへ表示する記録数。 */
  readonly displayRange = signal<ChartRange>(100);
  /** グラフで選択できる表示件数。 */
  readonly rangeOptions = [50, 100, 500, 1000, 'all'] as const;
  /** グラフの凡例として表示する系列一覧。 */
  readonly series = [
    { id: 'result', labelKey: 'history.solveResult' },
    { id: 'best', labelKey: 'common.best' },
    { id: 'ao5', labelKey: 'common.ao5' },
    { id: 'ao12', labelKey: 'common.ao12' },
  ] as const satisfies ReadonlyArray<{ id: ProgressSeries; labelKey: string }>;

  /** 絞り込み対象を古い順に集計した全グラフデータ。 */
  private readonly allPoints = computed<readonly ProgressPoint[]>(() => {
    const solves = [...this.historyStore.filteredSolves()].reverse();
    const times: number[] = [];
    let best = Infinity;
    return solves.map((solve, index) => {
      const result = this.cube.statTime(solve);
      times.push(result);
      best = Math.min(best, result);
      return {
        number: index + 1,
        result,
        best,
        ao5: this.averageAt(times, 5),
        ao12: this.averageAt(times, 12),
      };
    });
  });

  /** 選択件数に応じて全履歴から切り出した表示対象。 */
  readonly points = computed(() => {
    const points = this.allPoints();
    const range = this.displayRange();
    return range === 'all' ? points : points.slice(-range);
  });

  /** 縦軸の表示範囲を決める有限タイムの最小値と最大値。 */
  private readonly timeRange = computed(() => {
    const values = this.points().flatMap((point) =>
      this.series
        .map(({ id }) => point[id])
        .filter((value): value is number => Number.isFinite(value)),
    );
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const padding = Math.max((maximum - minimum) * 0.08, maximum * 0.04, 100);
    return { minimum: Math.max(minimum - padding, 0), maximum: maximum + padding };
  });

  /** 記録数から決定するデータ表示に必要な最小幅。 */
  readonly minimumChartWidth = computed(() => this.points().length * 64 + 80);
  /** グラフの上端座標。 */
  readonly plotTop = 12;
  /** グラフの下端座標。 */
  readonly plotBottom = 208;
  /** 右端へ表示する時間目盛りとグリッド線の位置。 */
  readonly axisTicks = computed(() => {
    const { minimum, maximum } = this.timeRange();
    return Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      return {
        y: this.plotTop + ratio * (this.plotBottom - this.plotTop),
        value: maximum - ratio * (maximum - minimum),
      };
    });
  });

  /** 指定系列の集計値を返す。 */
  value(point: ProgressPoint, series: ProgressSeries): number | undefined {
    return point[series];
  }

  /** 集計値を表示できる有限タイムか判定する。 */
  isAvailable(value: number | undefined): value is number {
    return Number.isFinite(value);
  }

  /** 計測位置を横軸座標へ変換する。 */
  xPosition(index: number): number {
    const pointCount = this.points().length;
    const plotWidth = this.minimumChartWidth() - 80;
    if (pointCount <= 1) return plotWidth / 2;
    return 32 + (index * (plotWidth - 64)) / (pointCount - 1);
  }

  /** タイムを縦軸座標へ変換する。 */
  yPosition(value: number | undefined): number {
    if (!this.isAvailable(value)) return this.plotBottom;
    const { minimum, maximum } = this.timeRange();
    const ratio = (value - minimum) / (maximum - minimum);
    return this.plotBottom - ratio * (this.plotBottom - this.plotTop);
  }

  /** DNFと件数不足で分割しながら系列を結ぶSVGパスを返す。 */
  linePath(series: ProgressSeries): string {
    let drawing = false;
    return this.points()
      .map((point, index) => {
        const value = this.value(point, series);
        if (!this.isAvailable(value)) {
          drawing = false;
          return '';
        }
        const command = drawing ? 'L' : 'M';
        drawing = true;
        return `${command} ${this.xPosition(index)} ${this.yPosition(value)}`;
      })
      .filter(Boolean)
      .join(' ');
  }

  /** 集計値をタイム、DNF、未集計記号のいずれかへ整形する。 */
  formatValue(value: number | undefined): string {
    if (value === undefined) return '—';
    return value === Infinity ? 'DNF' : this.cube.formatTime(value);
  }

  /** 指定件数が揃った時点のAverageを返す。 */
  private averageAt(times: readonly number[], count: number): number | undefined {
    return times.length < count ? undefined : average(times.slice(-count));
  }
}
