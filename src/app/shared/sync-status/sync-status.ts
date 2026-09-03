import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SolveSyncService } from '../../core/firestore/solve-sync.service';

/** ヘッダーでSolveのクラウド同期状態と再試行操作を表示する。 */
@Component({
  selector: 'app-sync-status',
  imports: [TranslocoPipe],
  templateUrl: './sync-status.html',
  styleUrl: './sync-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncStatus {
  /** Firestoreとの継続同期状態。 */
  protected readonly sync = inject(SolveSyncService);

  /** 同期エラー時に直近の変更または購読を再試行する。 */
  protected retry(): void {
    this.sync.retry();
  }
}
