import { Injectable, inject } from '@angular/core';
import { GroupService } from './group.service';
import { SolveService } from './solve.service';
import { GroupMembershipService } from './group-membership.service';
import { UserDataInitializer } from './user-data-initializer.service';
import { Penalty, RecordGroup, Solve, SolveCategory } from './cube.models';

/** 共有データへの窓口。状態の所有と操作は各ドメインへ、初期復元は専用の調整役へ委譲する。 */
@Injectable({ providedIn: 'root' })
export class CubeService {
  /** グループの状態と操作の所有者。 */
  private readonly groups = inject(GroupService);
  /** 記録の状態と操作の所有者。 */
  private readonly solves = inject(SolveService);
  /** グループと記録にまたがる所属操作の調整役。 */
  private readonly membership = inject(GroupMembershipService);
  /** 端末データの初期復元を一度だけ実行する。 */
  private readonly initialization = inject(UserDataInitializer);

  /** 全ドメインの初期復元と所属整理の完了を待つ。 */
  readonly ready = this.initialization.ready;
  /** 端末データが復元済みかを公開する。 */
  readonly storageReady = this.initialization.storageReady;
  /** SolveServiceが所有する、削除の同期待ちを含む全記録。 */
  readonly storedSolves = this.solves.storedSolves;
  /** SolveServiceが導出する、新しい順の未削除履歴。 */
  readonly activeSolves = this.solves.activeSolves;
  /** アカウント移行の候補となるゲスト記録。 */
  readonly guestSolves = this.solves.guestSolves;
  /** 現在のアカウントが所有する未削除記録。 */
  readonly accountSolves = this.solves.accountSolves;
  /** 記録ドメインの変更を永続化・同期へ接続する通知。 */
  readonly solveChange$ = this.solves.solveChange$;
  /** GroupServiceが所有するユーザー作成グループの台帳。 */
  readonly userGroups = this.groups.userGroups;
  /** 台帳と記録から導出する表示可能なグループ。 */
  readonly activeGroups = this.groups.activeGroups;
  /** Historyの表示対象とTimerの記録先で共有し、端末に保存する選択。 */
  readonly activeGroupId = this.groups.activeGroupId;
  /** 現在の記録先グループ。 */
  readonly activeGroup = this.groups.activeGroup;
  /** グループドメインの変更を永続化・同期へ接続する通知。 */
  readonly groupChange$ = this.groups.groupChange$;

  /**
   * クラウドから受信したグループを端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   */
  async mergeGroups(remoteGroups: readonly RecordGroup[]): Promise<void> {
    const deletedGroups = await this.groups.mergeGroups(remoteGroups);
    await this.membership.reconcileDeletedGroups(deletedGroups);
  }

  /**
   * この端末からクラウドへのグループ送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param group クラウドへの送信が成功したグループの版
   */
  async groupSyncFinished(group: RecordGroup): Promise<void> {
    return this.groups.groupSyncFinished(group);
  }

  /** 選択した未紐づけ記録グループを現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignGroupToAccount(group: RecordGroup, accountId: string): void {
    return this.groups.assignGroupToAccount(group, accountId);
  }

  /**
   * 記録グループを作成して記録先に設定する。
   *
   * @param name 作成するグループ名
   * @returns 作成したグループ。空白名の場合は`undefined`
   */
  addGroup(name: string): RecordGroup | undefined {
    return this.groups.addGroup(name);
  }

  /**
   * ユーザー作成グループの名前を変更する。既定グループは変更しない。
   *
   * @param id 名前を変更するグループID
   * @param name 新しいグループ名
   * @returns 名前を変更できた場合は`true`
   */
  renameGroup(id: string, name: string): boolean {
    return this.groups.renameGroup(id, name);
  }

  /**
   * 指定したユーザー作成グループを削除し、所属する記録を未分類へ移動する。既定グループは削除しない。
   * グループ整理で計測記録を失わず、削除後も履歴と集計から参照できる状態を守る。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(id: string): void {
    return this.membership.removeGroup(id);
  }

  /**
   * グループIDに対応する表示名を返す。
   *
   * @param groupId 検索するグループID
   * @returns グループ名。見つからない場合は既定グループ名
   */
  groupName(groupId?: string): string {
    return this.groups.groupName(groupId);
  }

  /**
   * クラウドから受信した計測記録を端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   */
  async mergeSolves(remoteSolves: readonly Solve[]): Promise<void> {
    if (await this.solves.mergeSolves(remoteSolves)) {
      await this.membership.reconcileDeletedGroups();
    }
  }

  /**
   * この端末からクラウドへの送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param solve クラウドへの送信が成功した計測記録の版
   */
  async solveSyncFinished(solve: Solve): Promise<void> {
    return this.solves.solveSyncFinished(solve);
  }

  /**
   * 現在のグループへ計測記録を追加する。
   *
   * @param time 計測時間（ミリ秒）
   * @param scramble 計測に使用したスクランブル
   * @param category 集計カテゴリーID
   * @param caseName ケース練習時の表示番号またはケース名
   * @param drill ケース練習の固定識別子とF2Lの対象スロット
   * @returns 保存した計測記録
   */
  addSolve(
    time: number,
    scramble: string,
    category: SolveCategory,
    caseName?: string,
    drill?: Pick<Solve, 'caseId' | 'f2lSlot'>,
  ): Solve {
    return this.solves.addSolve(
      this.groups.activeGroupId(),
      time,
      scramble,
      category,
      caseName,
      drill,
    );
  }

  /**
   * 指定ペナルティの適用と解除を切り替える。
   *
   * @param id 対象の計測記録ID
   * @param penalty 切り替えるペナルティ
   */
  togglePenalty(id: string, penalty: Exclude<Penalty, 'none'>): void {
    return this.solves.togglePenalty(id, penalty);
  }

  /**
   * 指定した計測記録を削除する。
   * 削除した計測記録は、クラウド同期が完了するまでtombstoneとして保持される。
   *
   * @param id 削除する計測記録ID
   */
  removeSolve(id: string): void {
    return this.solves.removeSolve(id);
  }

  /** 選択した未紐づけ記録を現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignSolveToAccount(solve: Solve, accountId: string): void {
    return this.solves.assignSolveToAccount(solve, accountId);
  }

  /** 別アカウントの記録を新しいIDでコピーする。元のローカル・クラウド記録は変更しない。 */
  copySolveToAccount(solve: Solve, accountId: string): void {
    return this.solves.copySolveToAccount(solve, accountId);
  }

  /** 未紐づけ、または現在のアカウントの記録だけに編集を許可する。 */
  canManageSolve(solve: Solve): boolean {
    return this.solves.canManageSolve(solve);
  }

  /** 別アカウントの記録を間接的にも変更しないグループ操作だけを許可する。 */
  canManageGroup(id: string): boolean {
    return this.groups.canManageGroup(id);
  }

  /** 両ドメインの同期取得後、存在しない所属先を整理する。 */
  async reconcileMissingGroups(ownerId: string): Promise<void> {
    return this.membership.reconcileMissingGroups(ownerId);
  }
}
