import { Signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { RecordGroup, Solve } from './cube.models';

/** ドメイン操作に必要なストアの状態と通知。状態の所有権はCubeServiceに残す。 */
export interface CubeOperationState {
  /** 削除の同期待ちを含む全記録。 */
  readonly storedSolves: WritableSignal<readonly Solve[]>;
  /** 操作対象となる未削除の記録。 */
  readonly activeSolves: Signal<readonly Solve[]>;
  /** ユーザー作成グループの台帳。 */
  readonly userGroups: WritableSignal<RecordGroup[]>;
  /** 現在の記録先。 */
  readonly activeGroupId: WritableSignal<string>;
  /** 記録変更を永続化処理へ通知する。 */
  readonly solveChange$: Subject<Solve | Solve[]>;
  /** グループ変更を永続化処理へ通知する。 */
  readonly groupChange$: Subject<RecordGroup>;
}
