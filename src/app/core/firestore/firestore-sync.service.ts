import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, mergeMap } from 'rxjs';
import { CubeService } from '../cube/cube';
import { GroupMutation, RecordGroup, Solve, SolveMutation } from '../cube/cube.models';

@Injectable({ providedIn: 'root' })
export class FirestoreSyncService {
  /** ローカル台帳と記録の参照先。 */
  private readonly cube = inject(CubeService);

  /** 同期サービスが一度ずつ処理するローカルSolve操作キュー。 */
  readonly solveMutations = signal<readonly SolveMutation[]>([]);

  /** 保存済みグループ変更の同期キュー。 */
  readonly groupMutations = signal<readonly GroupMutation[]>([]);

  constructor() {
    /** グループデータがアップデートされた */
    this.cube.groupChange$
      .pipe(
        filter((group) => group.ownerType === 'account'),
        takeUntilDestroyed(),
      )
      .subscribe((group) => this.queueGroup(group));

    /** 計測記録データがアップデートされた */
    this.cube.solveChange$
      .pipe(
        mergeMap((solve) => (Array.isArray(solve) ? solve : [solve])),
        filter((solve) => solve.ownerType === 'account'),
        takeUntilDestroyed(),
      )
      .subscribe((solve) => this.queueSolve(solve));

    // 同期が完了していないデータが残っていた場合、起動時に同期処理をする。
    void this.restorePendingMutations();
  }

  /** 記録グループをFirestore同期待ちのキュー追加する。 */
  queueGroup(group: RecordGroup): void {
    this.groupMutations.update((items) => [
      ...items,
      { kind: group.deletedAt ? 'delete' : 'put', data: group },
    ]);
  }

  /** 計測記録をFirestore同期待ちのキュー追加する。 */
  queueSolve(solve: Solve): void {
    // 計測記録がゲスト所有のグループを参照している場合、グループをアカウント所有に移行する。
    const group = this.cube.userGroups().find((g) => g.id === solve.groupId);
    if (group?.ownerType === 'guest') this.cube.assignGroupToAccount(group, solve.ownerId!);

    // 計測記録を同期待ちキューへ追加
    this.solveMutations.update((items) => [
      ...items,
      { kind: solve.deletedAt ? 'delete' : 'put', data: solve },
    ]);
  }

  /** 起動時に同期が完了していないデータをキューに復元する。 */
  private async restorePendingMutations(): Promise<void> {
    // 起動時の初期化を待つ
    await this.cube.ready;

    // 起動時に、同期待のグループが残っていた場合キューに追加する
    this.cube.userGroups().forEach((group) => {
      if (group.ownerType === 'account' && group.pendingSync) this.queueGroup(group);
    });

    // 起動時に、同期待の計測記録が残っていた場合キューに追加する
    this.cube.storedSolves().forEach((solve) => {
      if (solve.ownerType === 'account' && solve.pendingSync) this.queueSolve(solve);
    });
  }
}
