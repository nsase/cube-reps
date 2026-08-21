import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { HistoryStore } from '../history.store';
import { SolveRecord } from './solve-record/solve-record';
import { TranslocoPipe } from '@jsverse/transloco';

/** 絞り込み済みの計測記録と各記録の操作を表示するコンポーネント。 */
@Component({
  selector: 'app-solve-history',
  imports: [MatButtonModule, RouterLink, SolveRecord, TranslocoPipe],
  templateUrl: './solve-history.html',
  styleUrl: './solve-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveHistory {
  /** Historyコンポーネントツリー内で共有する画面状態。 */
  protected readonly store = inject(HistoryStore);
}
