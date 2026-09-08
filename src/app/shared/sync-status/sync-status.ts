import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { GroupSyncService } from '../../core/firestore/group-sync.service';
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
  protected readonly solveSync = inject(SolveSyncService);
  protected readonly groupSync = inject(GroupSyncService);

  /** Firestoreとの同期状態。 */
  protected readonly phase = computed(() => {
    const phases = [this.solveSync.phase(), this.groupSync.phase()];
    return (
      (['signed-out', 'error', 'offline', 'pending', 'syncing', 'synced'] as const).find((phase) =>
        phases.includes(phase),
      ) ?? 'synced'
    );
  });

  /** 同期エラー時に直近の変更または取得を再試行する。 */
  protected retry(): void {
    this.solveSync.retry();
    this.groupSync.retry();
  }
}
