import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { HistoryGroupPanel } from './history-group-panel/history-group-panel';
import { HistorySummary } from './history-summary/history-summary';
import { HistoryStore } from './history.store';
import { SolveHistory } from './solve-history/solve-history';

/** HistoryStoreのスコープを作り、履歴の子領域を構成するコンテナ。 */
@Component({
  selector: 'app-history',
  imports: [HistoryGroupPanel, HistorySummary, SolveHistory],
  providers: [HistoryStore],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  /** タイマー画面への遷移を親コンポーネントへ通知する。 */
  readonly showTimer = output<void>();
}
