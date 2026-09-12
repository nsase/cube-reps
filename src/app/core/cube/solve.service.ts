import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CubeOperationState } from './cube-operation-state';
import { Penalty, Solve, SolveCategory } from './cube.models';
import {
  USER_DATA_SCHEMA_VERSION,
  UserDataRepository,
} from '../local-storage/user-data-repository';
import { remoteWins, isLatestSyncData } from './sync-policy';
import { GroupService } from './group.service';

/** 計測記録の編集、所有権、同期反映とタイム表示を担当する。 */
@Injectable({ providedIn: 'root' })
export class SolveService {
  /** 操作を許可する現在のアカウント。 */
  private readonly auth = inject(AuthService);
  /** 操作結果の永続化先。 */
  private readonly userDataRepository = inject(UserDataRepository);
  /** 同期で取得した記録の所属先を整理する。 */
  private readonly groups = inject(GroupService);

  /**
   * クラウドから受信した計測記録を端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   */
  async mergeSolves(state: CubeOperationState, remoteSolves: readonly Solve[]): Promise<void> {
    const currentSolves = state.storedSolves();
    const solvesById = new Map(currentSolves.map((solve) => [solve.id, solve]));
    const changedSolves: Solve[] = [];
    for (const remote of remoteSolves) {
      const local = solvesById.get(remote.id);
      if (!remoteWins(local, remote)) continue;
      solvesById.set(remote.id, remote);
      changedSolves.push(remote);
    }
    if (changedSolves.length === 0) return;

    // storeを更新
    state.storedSolves.set(
      [...solvesById.values()]
        .filter((s) => !s.deletedAt || s.pendingSync)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
    // IndexedDBを更新
    const updatedSolves = changedSolves.filter((solve) => !solve.deletedAt);
    const deletedSolves = changedSolves.filter((solve) => solve.deletedAt);
    await Promise.all([
      ...updatedSolves.map((solve) => this.userDataRepository.putSolve(solve)),
      ...deletedSolves.map((solve) => this.userDataRepository.deleteSolve(solve.id)),
    ]);
    // 削除済みグループに所属する計測記録を未分類グループへ移動する
    await this.groups.reconcileDeletedGroups(state);
  }

  /**
   * この端末からクラウドへの送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param solve クラウドへの送信が成功した計測記録の版
   */
  async solveSyncFinished(state: CubeOperationState, solve: Solve): Promise<void> {
    const current = state.storedSolves().find((s) => s.id === solve.id);
    if (!current || !isLatestSyncData(current, solve)) return;

    const { pendingSync: _pending, ...saved } = solve;
    state.storedSolves.update((solves) =>
      saved.deletedAt
        ? solves.filter((s) => s.id !== saved.id)
        : solves.map((s) => (s.id === saved.id ? saved : s)),
    );
    if (saved.deletedAt) await this.userDataRepository.deleteSolve(saved.id);
    else await this.userDataRepository.putSolve(saved);
  }

  /**
   * 現在のグループへ計測記録を追加する。
   *
   * @param time 計測時間（ミリ秒）
   * @param scramble 計測に使用したスクランブル
   * @param category 集計カテゴリーID
   * @param caseName PLL練習時のケース名
   * @returns 保存した計測記録
   */
  addSolve(
    state: CubeOperationState,
    time: number,
    scramble: string,
    category: SolveCategory,
    caseName?: string,
  ): Solve {
    // 計測記録を作成
    const now = new Date().toISOString();
    const accountId = this.auth.user()?.uid;
    const solve: Solve = {
      id: crypto.randomUUID(),
      time,
      scramble,
      createdAt: now,
      updatedAt: now,
      ownerType: accountId ? 'account' : 'guest',
      ...(accountId ? { ownerId: accountId } : {}),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
      category,
      caseName,
      groupId: state.activeGroupId(),
      penalty: 'none',
      pendingSync: !!accountId,
    };
    state.storedSolves.update((solves) => [solve, ...solves]);

    // 計測記録の変更を通知（DBへの保存などを行う）
    state.solveChange$.next(solve);
    return solve;
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(state: CubeOperationState, id: string, penalty: Exclude<Penalty, 'none'>): void {
    // 計測記録がない（tombstone含む）、または別アカウントデータであれば、編集はできない
    const current = state.activeSolves().find((solve) => solve.id === id);
    if (!current || !this.canManageSolve(current)) return;

    // 計測記録のペナルティーを更新する
    const updated: Solve = {
      ...current,
      updatedAt: new Date().toISOString(),
      penalty: current.penalty === penalty ? 'none' : penalty,
      pendingSync: current.ownerType === 'account',
    };
    state.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === id ? updated : solve)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    state.solveChange$.next(updated);
  }

  /**
   * 指定した計測記録を削除する。
   * 削除した計測記録は、クラウド同期が完了するまでtombstoneとして保持される。
   *
   * @param id 削除する計測記録ID
   */
  removeSolve(state: CubeOperationState, id: string): void {
    // 計測記録がない（tombstone含む）、または別アカウントデータであれば、削除はできない
    const current = state.activeSolves().find((solve) => solve.id === id);
    if (!current || !this.canManageSolve(current)) return;

    // 計測記録を削除する
    const now = new Date().toISOString();
    const deleted = {
      ...current,
      updatedAt: now,
      deletedAt: now,
      pendingSync: current.ownerType === 'account',
    };
    state.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === id ? deleted : solve)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    state.solveChange$.next(deleted);
  }

  /** 選択した未紐づけ記録を現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignSolveToAccount(state: CubeOperationState, solve: Solve, accountId: string): void {
    // ゲスト記録以外は移行できない。アカウント間の移行はコピーで行う。
    if (solve.ownerType !== 'guest') throw new Error('Invalid transfer source');

    // 計測記録をアカウントに移行する
    const updated: Solve = {
      ...solve,
      updatedAt: new Date().toISOString(),
      ownerType: 'account',
      ownerId: accountId,
      pendingSync: true,
    };
    state.storedSolves.update((solves) =>
      solves.map((item) => (item.id === solve.id ? updated : item)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    state.solveChange$.next(updated);
  }

  /** 別アカウントの記録を新しいIDでコピーする。元のローカル・クラウド記録は変更しない。 */
  copySolveToAccount(state: CubeOperationState, solve: Solve, accountId: string): void {
    // アカウント所有の計測記録のみコピー可能。ゲスト所有の計測記録はassignSolveToAccountで移行する。
    if (solve.ownerType !== 'account') throw new Error('Invalid transfer source');

    // 計測記録をアカウントに移行する
    const now = new Date().toISOString();
    const updated: Solve = {
      ...solve,
      id: crypto.randomUUID(),
      updatedAt: now,
      ownerType: 'account',
      ownerId: accountId,
      pendingSync: true,
    };
    state.storedSolves.update((solves) => [...solves, updated]);

    // 計測記録の変更を通知（DBへの保存などを行う）
    state.solveChange$.next(updated);
  }

  /** 未紐づけ、または現在のアカウントの記録だけに編集を許可する。 */
  canManageSolve(solve: Solve): boolean {
    return (
      !solve.deletedAt &&
      (solve.ownerType === 'guest' ||
        Boolean(solve.ownerId && solve.ownerId === this.auth.user()?.uid))
    );
  }

  /**
   * +2ペナルティを反映した計測時間を返す。
   *
   * @param solve 対象の計測記録
   * @returns 補正後の時間（ミリ秒）
   */
  finalTime(solve: Solve): number {
    return solve.time + (solve.penalty === '+2' ? 2000 : 0);
  }

  /**
   * 集計用にDNFを最悪値へ変換したタイムを返す。
   *
   * @param solve 対象の計測記録
   * @returns +2反映後のタイム。DNFの場合は`Infinity`
   */
  statTime(solve: Solve): number {
    return solve.penalty === 'DNF' ? Infinity : this.finalTime(solve);
  }

  /**
   * ミリ秒をタイマー表示用文字列へ整形する。
   *
   * @param milliseconds 整形する時間
   * @returns `m:ss.cc`または`s.cc`形式。有限値でない場合は`—`
   */
  formatTime(milliseconds: number): string {
    if (!Number.isFinite(milliseconds)) return '—';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const centiseconds = Math.floor((milliseconds % 1000) / 10);
    return `${minutes ? `${minutes}:` : ''}${minutes ? String(seconds).padStart(2, '0') : seconds}.${String(centiseconds).padStart(2, '0')}`;
  }

  /**
   * ペナルティを含む記録の表示文字列を返す。
   *
   * @param solve 表示する計測記録
   * @returns DNFまたは整形済みタイム
   */
  displayTime(solve: Solve): string {
    return solve.penalty === 'DNF'
      ? 'DNF'
      : `${this.formatTime(this.finalTime(solve))}${solve.penalty === '+2' ? '+' : ''}`;
  }
}
