import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { Penalty, Solve, SolveCategory } from './cube.models';
import {
  USER_DATA_SCHEMA_VERSION,
  UserDataRepository,
} from '../local-storage/user-data-repository';
import { remoteWins, isLatestSyncData } from './sync-policy';

/** 計測記録の状態を所有し、編集・所有権・同期反映を担当する。 */
@Injectable({ providedIn: 'root' })
export class SolveService {
  /** 操作を許可する現在のアカウント。 */
  private readonly auth = inject(AuthService);
  /** 操作結果の永続化先。 */
  private readonly userDataRepository = inject(UserDataRepository);
  /** tombstoneを含む、ブラウザ内の全所有者の計測記録。 */
  readonly storedSolves = signal<readonly Solve[]>([]);
  /** 認証状態に関係なく公開する、新しい順のブラウザ内履歴。削除済みのものは含まない。 */
  readonly activeSolves = computed(() =>
    this.storedSolves()
      .filter((solve) => !solve.deletedAt)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
  );
  /** アカウント未紐づけで、選択移行の対象になる計測記録。 */
  readonly guestSolves = computed(() =>
    this.storedSolves().filter((solve) => solve.ownerType === 'guest' && !solve.deletedAt),
  );
  /** 現在ログイン中のアカウントが所有する、未削除の計測記録。 */
  readonly accountSolves = computed(() => {
    const accountId = this.auth.user()?.uid;
    if (!accountId) return [];
    return this.storedSolves().filter(
      (solve) => solve.ownerType === 'account' && solve.ownerId === accountId && !solve.deletedAt,
    );
  });

  /** 計測記録の変更を永続化・同期へ通知する。 */
  readonly solveChange$ = new Subject<Solve | Solve[]>();

  /**
   * クラウドから受信した計測記録を端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   * @returns 更新を反映した場合はtrue。所属整理が必要かを呼び出し側へ通知する。
   */
  async mergeSolves(remoteSolves: readonly Solve[]): Promise<boolean> {
    const currentSolves = this.storedSolves();
    const solvesById = new Map(currentSolves.map((solve) => [solve.id, solve]));
    const changedSolves: Solve[] = [];
    for (const remote of remoteSolves) {
      const local = solvesById.get(remote.id);
      if (!remoteWins(local, remote)) continue;
      solvesById.set(remote.id, remote);
      changedSolves.push(remote);
    }
    if (changedSolves.length === 0) return false;

    // storeを更新
    this.storedSolves.set(
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
    return true;
  }

  /**
   * この端末からクラウドへの送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param solve クラウドへの送信が成功した計測記録の版
   */
  async solveSyncFinished(solve: Solve): Promise<void> {
    const current = this.storedSolves().find((s) => s.id === solve.id);
    if (!current || !isLatestSyncData(current, solve)) return;

    const { pendingSync: _pending, ...saved } = solve;
    this.storedSolves.update((solves) =>
      saved.deletedAt
        ? solves.filter((s) => s.id !== saved.id)
        : solves.map((s) => (s.id === saved.id ? saved : s)),
    );
    if (saved.deletedAt) await this.userDataRepository.deleteSolve(saved.id);
    else await this.userDataRepository.putSolve(saved);
  }

  /**
   * 指定された記録先へ計測記録を追加する。
   *
   * @param groupId 保存先のグループID
   * @param time 計測時間（ミリ秒）
   * @param scramble 計測に使用したスクランブル
   * @param category 集計カテゴリーID
   * @param caseName ケース練習時の表示番号またはケース名
   * @param drill ケース練習の固定識別子とF2Lの対象スロット
   * @returns 保存した計測記録
   */
  addSolve(
    groupId: string,
    time: number,
    scramble: string,
    category: SolveCategory,
    caseName?: string,
    drill?: Pick<Solve, 'caseId' | 'f2lSlot'>,
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
      ...(category === 'full' ? {} : drill),
      groupId,
      penalty: 'none',
      pendingSync: !!accountId,
    };
    this.storedSolves.update((solves) => [solve, ...solves]);

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(solve);
    return solve;
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(id: string, penalty: Exclude<Penalty, 'none'>): void {
    // 計測記録がない（tombstone含む）、または別アカウントデータであれば、編集はできない
    const current = this.activeSolves().find((solve) => solve.id === id);
    if (!current || !this.canManageSolve(current)) return;

    // 計測記録のペナルティーを更新する
    const updated: Solve = {
      ...current,
      updatedAt: new Date().toISOString(),
      penalty: current.penalty === penalty ? 'none' : penalty,
      pendingSync: current.ownerType === 'account',
    };
    this.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === id ? updated : solve)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(updated);
  }

  /**
   * 指定した計測記録を削除する。
   * 削除した計測記録は、クラウド同期が完了するまでtombstoneとして保持される。
   *
   * @param id 削除する計測記録ID
   */
  removeSolve(id: string): void {
    // 計測記録がない（tombstone含む）、または別アカウントデータであれば、削除はできない
    const current = this.activeSolves().find((solve) => solve.id === id);
    if (!current || !this.canManageSolve(current)) return;

    // 計測記録を削除する
    const now = new Date().toISOString();
    const deleted = {
      ...current,
      updatedAt: now,
      deletedAt: now,
      pendingSync: current.ownerType === 'account',
    };
    this.storedSolves.update((solves) =>
      solves.map((solve) => (solve.id === id ? deleted : solve)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(deleted);
  }

  /** 選択した未紐づけ記録を現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignSolveToAccount(solve: Solve, accountId: string): void {
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
    this.storedSolves.update((solves) =>
      solves.map((item) => (item.id === solve.id ? updated : item)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(updated);
  }

  /** 別アカウントの記録を新しいIDでコピーする。元のローカル・クラウド記録は変更しない。 */
  copySolveToAccount(solve: Solve, accountId: string): void {
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
    this.storedSolves.update((solves) => [...solves, updated]);

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solveChange$.next(updated);
  }

  /** 未紐づけ、または現在のアカウントの記録だけに編集を許可する。 */
  canManageSolve(solve: Solve): boolean {
    return (
      !solve.deletedAt &&
      (solve.ownerType === 'guest' ||
        Boolean(solve.ownerId && solve.ownerId === this.auth.user()?.uid))
    );
  }
}
