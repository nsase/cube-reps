import { computed, inject, Injectable } from '@angular/core';
import { CubeService } from '../cube';
import { FirestoreSolveRepository } from './firestore-solve.repository';
import { GroupSyncService } from './group-sync.service';
import { SyncController, SyncPhase } from './sync-controller';

/** ヘッダーへ公開するユーザーデータの同期状態。 */
export type SolveSyncPhase = SyncPhase;

/** Solveとグループの同期をまとめて更新・再試行する。 */
@Injectable({ providedIn: 'root' })
export class SolveSyncService {
  /** Solveの変更と統合を担うローカル境界。 */
  private readonly cube = inject(CubeService);
  /** Solveの転送と認証・ネットワーク監視。 */
  private readonly controller = new SyncController({
    ready: this.cube.ready,
    mutations: this.cube.solveMutations,
    record: (mutation) => mutation.data,
    cloud: inject(FirestoreSolveRepository),
    merge: async (uid, solves) => {
      await this.cube.mergeAccountSolves(uid, solves);
      await this.cube.prepareAccountGroups(uid);
    },
    acknowledge: (solve) => this.cube.acknowledgeSync(solve),
  });
  /** グループも同じユーザー操作で同期する。 */
  private readonly groups = inject(GroupSyncService);
  /** どちらかの失敗や未完了を成功表示で隠さない同期状態。 */
  readonly phase = computed<SolveSyncPhase>(() => {
    const phases = [this.controller.phase(), this.groups.phase()];
    return (
      (['signed-out', 'error', 'offline', 'pending', 'syncing', 'synced'] as const).find((phase) =>
        phases.includes(phase),
      ) ?? 'synced'
    );
  });
  /** 両方の失敗した転送を再試行する。 */
  retry(): void {
    this.controller.retry();
    this.groups.retry();
  }
  /** Solveとグループを再取得する。 */
  refresh(): void {
    this.controller.refresh();
    this.groups.refresh();
  }
}
