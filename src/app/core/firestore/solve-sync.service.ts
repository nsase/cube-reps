import { inject, Injectable } from '@angular/core';
import { GroupSyncService } from './group-sync.service';
import { CubeService } from '../cube';
import { FirestoreSolveRepository } from './firestore-solve.repository';
import { FirestoreSyncService } from './firestore-sync.service';
import { SyncController, SyncPhase } from './sync-controller';

/** ヘッダーへ公開するユーザーデータの同期状態。 */
export type SolveSyncPhase = SyncPhase;

/** Solveとグループの同期をまとめて更新・再試行する。 */
@Injectable({ providedIn: 'root' })
export class SolveSyncService {
  /** Solveの変更と統合を担うローカル境界。 */
  private readonly cube = inject(CubeService);

  /** Firestoreとの同期を管理するサービス。 */
  private readonly firestoreSyncService = inject(FirestoreSyncService);

  /** アップロードするデータ */
  private readonly mutations = this.firestoreSyncService.solveMutations;

  /** 全取得経路で先にグループ一覧を確定するサービス。 */
  private readonly groups = inject(GroupSyncService);

  /** Solveの転送と認証・ネットワーク監視。 */
  private readonly controller = new SyncController({
    beforePull: () => this.groups.refresh(),
    mutations: this.mutations,
    record: (mutation) => mutation.data,
    cloud: inject(FirestoreSolveRepository),
    merge: async (solves, userId) => {
      await this.cube.mergeSolves(solves);
      await this.cube.reconcileMissingGroups(userId);
    },
    acknowledge: (solve) => this.cube.solveSyncFinished(solve),
  });

  /** 同期状態。 */
  readonly phase = this.controller.phase;

  /** 失敗した転送を再試行する。 */
  async retry(): Promise<void> {
    await this.controller.retry();
  }
  /** 計測記録を再取得する。 */
  async refresh(): Promise<void> {
    await this.controller.refresh();
  }
}
