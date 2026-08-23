import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { HistoryProgressChartContent } from './history-progress-chart-content/history-progress-chart-content';
import { HistoryProgressChartHeader } from './history-progress-chart-header/history-progress-chart-header';
import { HistoryProgressChartStore } from './history-progress-chart.store';

/** 履歴グラフのスコープを作り、ヘッダーと描画領域を構成するコンテナ。 */
@Component({
  selector: 'app-history-progress-chart',
  imports: [TranslocoPipe, HistoryProgressChartHeader, HistoryProgressChartContent],
  providers: [HistoryProgressChartStore],
  templateUrl: './history-progress-chart.html',
  styleUrl: './history-progress-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryProgressChart {
  /** チャート内で共有する表示対象と集計状態。 */
  protected readonly store = inject(HistoryProgressChartStore);
}
