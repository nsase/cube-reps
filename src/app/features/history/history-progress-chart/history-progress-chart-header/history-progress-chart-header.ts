import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { HistoryProgressChartStore } from '../history-progress-chart.store';

/** 履歴グラフのタイトル、表示範囲、凡例を表示する。 */
@Component({
  selector: 'app-history-progress-chart-header',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './history-progress-chart-header.html',
  styleUrl: './history-progress-chart-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryProgressChartHeader {
  /** チャート内で共有する表示範囲と系列定義。 */
  protected readonly store = inject(HistoryProgressChartStore);
}
