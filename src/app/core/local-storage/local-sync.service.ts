import { effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mergeMap } from 'rxjs';
import { CubeService } from '../cube/cube';
import { GroupMutation, RecordGroup, Solve, SolveMutation } from '../cube/cube.models';
import { UserDataRepository } from './user-data-repository';

@Injectable({ providedIn: 'root' })
export class LocalSyncService {
  /** ローカル台帳と記録の参照先。 */
  private readonly cube = inject(CubeService);

  /** 同期対象データの永続化。 */
  private readonly userDataRepository = inject(UserDataRepository);

  /** 保存対象の計測記録の変更キュー。 */
  readonly solveMutations = signal<readonly SolveMutation[]>([]);

  /** 保存対象のグループの変更キュー。 */
  readonly groupMutations = signal<readonly GroupMutation[]>([]);

  constructor() {
    // 計測記録データがアップデートされた
    this.cube.solveChange$
      .pipe(
        mergeMap((solve) => (Array.isArray(solve) ? solve : [solve])),
        takeUntilDestroyed(),
      )
      .subscribe((solve) => this.queueSolve(solve));

    // グループデータがアップデートされた
    this.cube.groupChange$.pipe(takeUntilDestroyed()).subscribe((group) => this.queueGroup(group));

    // 計測記録がアップデートされたら、IndexedDBへ保存する
    effect(() => this.saveSolves(this.solveMutations(), this.cube.storageReady()));

    // グループ記録がアップデートされたら、IndexedDBへ保存する
    effect(() => this.saveGroups(this.groupMutations(), this.cube.storageReady()));
  }

  /** 変更のあった計測記録をIndexedDB保存待ちキューに追加する。 */
  queueSolve(solve: Solve): void {
    this.solveMutations.update((items) => [
      ...items,
      { kind: solve.deletedAt ? 'delete' : 'put', data: solve },
    ]);
  }

  /** 変更のあった記録グループをIndexedDB保存待ちキューに追加する。 */
  queueGroup(group: RecordGroup): void {
    this.groupMutations.update((items) => [
      ...items,
      { kind: group.deletedAt ? 'delete' : 'put', data: group },
    ]);
  }

  /**
   * 計測記録をIndexedDBへ保存する。
   * @param solves
   */
  private saveSolves(solves: readonly SolveMutation[], storageReady: boolean): void {
    // 起動時のIndexDBの読み込みが終わってない場合は、書き込みは保留する。
    // 処理待ちのキューがない場合も処理せず終了する。
    if (!storageReady || solves.length === 0) return;

    for (const solve of solves) {
      // ゲストデータを削除する場合は、IndexedDBから即削除する
      // アカウントデータを削除する場合は、クラウドと同期するためにtombstoneとして保持する
      // 削除以外の場合は、IndexedDBへ保存する
      if (solve.kind === 'delete' && solve.data.ownerType === 'guest') {
        void this.userDataRepository.deleteSolve(solve.data.id);
      } else {
        void this.userDataRepository.putSolve(solve.data);
      }
    }

    // 処理を終えたら、キューを空にする
    this.solveMutations.set([]);
  }

  /**
   * グループをIndexedDBへ保存する。
   * @param groups
   */
  private saveGroups(groups: readonly GroupMutation[], storageReady: boolean): void {
    // 起動時のIndexDBの読み込みが終わってない場合は、書き込みは保留する。
    // 処理待ちのキューがない場合も処理せず終了する。
    if (!storageReady || groups.length === 0) return;

    for (const group of groups) {
      // ゲストデータを削除する場合は、IndexedDBから即削除する
      // アカウントデータを削除する場合は、クラウドと同期するためにtombstoneとして保持する
      // 削除以外の場合は、IndexedDBへ保存する
      if (group.kind === 'delete' && group.data.ownerType === 'guest') {
        void this.userDataRepository.deleteRecordGroup(group.data.id);
      } else {
        void this.userDataRepository.putRecordGroup(group.data);
      }
    }

    // 処理を終えたら、キューを空にする
    this.groupMutations.set([]);
  }
}
