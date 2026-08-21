import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { HistoryStore } from '../history.store';
import { SolveRecord } from './solve-record/solve-record';

/** 絞り込み済みの計測記録と各記録の操作を表示するコンポーネント。 */
@Component({
  selector: 'app-solve-history',
  imports: [MatButtonModule, SolveRecord],
  templateUrl: './solve-history.html',
  styleUrl: './solve-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveHistory {
  /** タイマー画面への遷移を親コンポーネントへ通知する。 */
  readonly showTimer = output<void>();

  /** Historyコンポーネントツリー内で共有する画面状態。 */
  protected readonly store = inject(HistoryStore);
}
