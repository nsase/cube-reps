import { Injectable, inject, signal } from '@angular/core';
import { GroupService } from './group.service';
import { Solve } from './cube.models';

/** Historyから次回のTimerへだけリトライ条件を受け渡す。 */
@Injectable({ providedIn: 'root' })
export class SolveRetryService {
  /** 存在するグループだけをリトライの記録先として選択する。 */
  private readonly groups = inject(GroupService);
  /** 取得時に消費するリトライ指定。画面のカテゴリー状態は保持しない。 */
  private readonly retrySolve = signal<Solve | undefined>(undefined);

  /**
   * 履歴の記録を次回のタイマー表示でリトライできる状態にする。
   * リトライ結果を元記録と同じ条件で保存できるように、カテゴリーと存在する記録グループも引き継ぐ。
   *
   * @param solve リトライする計測記録
   */
  prepareRetry(solve: Solve): void {
    this.retrySolve.set(solve);
    if (solve.groupId && this.groups.activeGroups().some(({ id }) => id === solve.groupId)) {
      this.groups.activeGroupId.set(solve.groupId);
    }
  }

  /**
   * 履歴から指定されたリトライ対象を一度だけ取得する。
   * 通常のタイマー再表示で古いスクランブルを再利用しないように、取得と同時に指定を消費する。
   *
   * @returns リトライ対象。指定されていない場合は`undefined`
   */
  takeRetrySolve(): Solve | undefined {
    const solve = this.retrySolve();
    this.retrySolve.set(undefined);
    return solve;
  }
}
