import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { HistoryProgressChartStore } from '../history-progress-chart.store';

/** 履歴グラフのSVG描画を担当する。 */
@Component({
  selector: 'app-history-progress-chart-content',
  imports: [TranslocoPipe],
  templateUrl: './history-progress-chart-content.html',
  styleUrl: './history-progress-chart-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryProgressChartContent {
  /** チャート内で共有する集計値とSVG座標。 */
  protected readonly store = inject(HistoryProgressChartStore);
}
