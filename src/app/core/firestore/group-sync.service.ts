import { inject, Injectable } from '@angular/core';
import { CubeService } from '../cube';
import { FirestoreGroupRepository } from './firestore-group.repository';
import { FirestoreSyncService } from './firestore-sync.service';
import { SyncController } from './sync-controller';

/** グループの保存境界を共通同期処理へ接続する。 */
@Injectable({ providedIn: 'root' })
export class GroupSyncService {
  /** グループの変更・統合を担当するローカル境界。 */
  private readonly cube = inject(CubeService);

  /** Firestoreとの同期を管理するサービス。 */
  private readonly firestoreSyncService = inject(FirestoreSyncService);

  /** アップロードするデータ */
  private readonly mutations = this.firestoreSyncService.groupMutations;

  /** グループの同期状態と再送処理。 */
  private readonly controller = new SyncController({
    autoPull: false,
    mutations: this.mutations,
    record: (mutation) => mutation.data,
    cloud: inject(FirestoreGroupRepository),
    merge: (groups) => this.cube.mergeGroups(groups),
    acknowledge: (group) => this.cube.groupSyncFinished(group),
  });

  /** グループの同期状態。 */
  readonly phase = this.controller.phase;

  /** 失敗した転送を再試行する。 */
  async retry(): Promise<void> {
    await this.controller.retry();
  }
  /** Solve取得の前提となるグループ一覧を取得する。
   * @returns 取得・統合が正常に完了した場合はtrue
   */
  async refresh(): Promise<boolean> {
    return this.controller.refresh();
  }
}
