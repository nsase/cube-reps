import { inject, Injectable } from '@angular/core';
import { CubeService } from '../cube';
import { FirestoreGroupRepository } from './firestore-group.repository';
import { SyncController } from './sync-controller';

/** グループの保存境界を共通同期処理へ接続する。 */
@Injectable({ providedIn: 'root' })
export class GroupSyncService {
  /** グループの変更・統合を担当するローカル境界。 */
  private readonly cube = inject(CubeService);
  /** グループの同期状態と再送処理。 */
  private readonly controller = new SyncController({
    ready: this.cube.ready,
    mutations: this.cube.groupMutations,
    record: (mutation) => mutation.data,
    cloud: inject(FirestoreGroupRepository),
    merge: (uid, groups) => this.cube.mergeAccountGroups(uid, groups),
    acknowledge: (group) => this.cube.acknowledgeGroupSync(group),
  });
  /** グループの同期状態。 */
  readonly phase = this.controller.phase;
  /** 失敗した転送を再試行する。 */
  retry(): void {
    this.controller.retry();
  }
  /** グループ一覧を再取得する。 */
  refresh(): void {
    this.controller.refresh();
  }
}
