import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CubeOperationState } from './cube-operation-state';
import { RecordGroup } from './cube.models';
import {
  USER_DATA_SCHEMA_VERSION,
  UserDataRepository,
} from '../local-storage/user-data-repository';
import { DEFAULT_GROUP, DEFAULT_GROUPS } from './default-groups';
import { remoteWins, isLatestSyncData } from './sync-policy';

/** 記録グループの編集、所有権と同期後の所属整理を担当する。 */
@Injectable({ providedIn: 'root' })
export class GroupService {
  /** 操作を許可する現在のアカウント。 */
  private readonly auth = inject(AuthService);
  /** 操作結果の永続化先。 */
  private readonly userDataRepository = inject(UserDataRepository);

  /**
   * クラウドから受信したグループを端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   */
  async mergeGroups(
    state: CubeOperationState,
    remoteGroups: readonly RecordGroup[],
  ): Promise<void> {
    const currentGroups = state.userGroups();
    const groupsById = new Map(currentGroups.map((group) => [group.id, group]));
    const changedGroups: RecordGroup[] = [];
    for (const remote of remoteGroups) {
      const local = groupsById.get(remote.id);
      if (!remoteWins(local, remote)) continue;
      groupsById.set(remote.id, remote);
      changedGroups.push(remote);
    }
    if (changedGroups.length === 0) {
      await this.reconcileDeletedGroups(state, remoteGroups);
      return;
    }

    // storeを更新
    state.userGroups.set(
      [...groupsById.values()]
        .filter((group) => !group.deletedAt || group.pendingSync)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
    // IndexedDBを更新
    const updatedGroups = changedGroups.filter((group) => !group.deletedAt);
    const deletedGroups = changedGroups.filter((group) => group.deletedAt);
    await Promise.all([
      ...updatedGroups.map((group) => this.userDataRepository.putRecordGroup(group)),
      ...deletedGroups.map((group) => this.userDataRepository.deleteRecordGroup(group.id)),
    ]);

    // 削除済みグループに所属する計測記録を未分類グループへ移動する
    await this.reconcileDeletedGroups(state, deletedGroups);
  }

  /**
   * この端末からクラウドへのグループ送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param group クラウドへの送信が成功したグループの版
   */
  async groupSyncFinished(state: CubeOperationState, group: RecordGroup): Promise<void> {
    const current = state.userGroups().find((g) => g.id === group.id);
    if (!current || !isLatestSyncData(current, group)) return;

    const { pendingSync: _pending, ...saved } = group;
    state.userGroups.update((groups) =>
      saved.deletedAt
        ? groups.filter((g) => g.id !== saved.id)
        : groups.map((g) => (g.id === saved.id ? saved : g)),
    );
    if (saved.deletedAt) await this.userDataRepository.deleteRecordGroup(saved.id);
    else await this.userDataRepository.putRecordGroup(saved);
  }

  /** 選択した未紐づけ記録グループを現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignGroupToAccount(state: CubeOperationState, group: RecordGroup, accountId: string): void {
    // ゲスト記録以外は移行できない。アカウント間の移行はコピーで行う。
    if (group.ownerType !== 'guest') throw new Error('Invalid transfer source');

    // 計測記録をアカウントに移行する
    const updated: RecordGroup = {
      ...group,
      updatedAt: new Date().toISOString(),
      ownerType: 'account',
      ownerId: accountId,
      pendingSync: true,
    };
    state.userGroups.update((groups) =>
      groups.map((item) => (item.id === group.id ? updated : item)),
    );

    // 記録グループの変更を通知（DBへの保存などを行う）
    state.groupChange$.next(updated);
  }

  /**
   * 記録グループを作成して記録先に設定する。
   *
   * @param name 作成するグループ名
   * @returns 作成したグループ。空白名の場合は`undefined`
   */
  addGroup(state: CubeOperationState, name: string): RecordGroup | undefined {
    // グループを追加
    const trimmedName = name.trim();
    if (!trimmedName) return undefined;
    const now = new Date().toISOString();
    const group: RecordGroup = {
      id: crypto.randomUUID(),
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      ownerType: this.auth.user() ? 'account' : 'guest',
      ...(this.auth.user() ? { ownerId: this.auth.user()!.uid, pendingSync: true } : {}),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    state.userGroups.update((groups) => [...groups, group]);

    // 作成したグループをアクティブな記録先に設定
    state.activeGroupId.set(group.id);

    // グループの変更を通知（DBへの保存などを行う）
    state.groupChange$.next(group);
    return group;
  }

  /**
   * ユーザー作成グループの名前を変更する。既定グループは変更しない。
   *
   * @param id 名前を変更するグループID
   * @param name 新しいグループ名
   * @returns 名前を変更できた場合は`true`
   */
  renameGroup(state: CubeOperationState, id: string, name: string): boolean {
    // 名前が空だった場合やデフォルトグループだった場合は名前を変更しない
    const trimmedName = name.trim();
    if (!trimmedName || DEFAULT_GROUPS.some((group) => group.id === id)) return false;

    // ほかアカウントのデータが混ざっている場合は変更しない(Guestデータの場合は変更可能)
    const current = state.userGroups().find((group) => group.id === id);
    if (!current || !this.canManageGroup(state, id)) return false;

    // グループ名を更新
    const updated = {
      ...current,
      pendingSync: current.ownerType === 'account',
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    };
    state.userGroups.update((groups) => groups.map((group) => (group.id === id ? updated : group)));

    // グループの変更を通知（DBへの保存などを行う）
    state.groupChange$.next(updated);
    return true;
  }

  /**
   * 指定したユーザー作成グループを削除し、所属する記録を未分類へ移動する。既定グループは削除しない。
   * グループ整理で計測記録を失わず、削除後も履歴と集計から参照できる状態を守る。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(state: CubeOperationState, id: string): void {
    // 既定グループは削除しない
    if (DEFAULT_GROUPS.some((group) => group.id === id)) return;

    // ほかアカウントのデータが混ざっている場合は削除しない(Guestデータの場合は削除可能)
    if (!this.canManageGroup(state, id)) return;

    // 削除対象グループを取得（取得できない場合は削除処理は中止）
    const group = state.userGroups().find((group) => group.id === id);
    if (!group) return;

    // 削除するグループに属する計測記録を「未分類」へ移動する
    const now = new Date().toISOString();
    const affectedSolves = state
      .storedSolves()
      .filter((solve) => solve.groupId === id)
      .map((solve) => ({
        ...solve,
        groupId: DEFAULT_GROUP.id,
        updatedAt: now,
        pendingSync: solve.ownerType === 'account',
      }));
    const affectedById = new Map(affectedSolves.map((solve) => [solve.id, solve]));
    state.storedSolves.update((solves) =>
      solves.map((solve) => affectedById.get(solve.id) ?? solve),
    );

    // グループを削除
    const deleted = {
      ...group,
      updatedAt: now,
      deletedAt: now,
      pendingSync: group.ownerType === 'account',
    };
    state.userGroups.update((groups) => groups.map((item) => (item.id === id ? deleted : item)));

    // 計測記録の変更を通知（DBへの保存などを行う）
    state.solveChange$.next(affectedSolves);

    // グループの変更を通知（DBへの保存などを行う）
    state.groupChange$.next(deleted);

    // 削除したグループが現在のアクティブグループだった場合は、未分類を選択する
    if (state.activeGroupId() === id) state.activeGroupId.set(DEFAULT_GROUP.id);
  }

  /** 別アカウントの記録を間接的にも変更しないグループ操作だけを許可する。 */
  canManageGroup(state: CubeOperationState, id: string): boolean {
    const group = state.userGroups().find((group) => group.id === id);
    return Boolean(
      group &&
      !group.deletedAt &&
      (group.ownerType === 'guest' ||
        Boolean(group.ownerId && group.ownerId === this.auth.user()?.uid)) &&
      state
        .activeSolves()
        .filter((solve) => solve.groupId === id)
        .every(
          (solve) =>
            !solve.deletedAt &&
            (solve.ownerType === 'guest' ||
              Boolean(solve.ownerId && solve.ownerId === this.auth.user()?.uid)),
        ),
    );
  }

  /** GroupとSolveの取得成功後、現在のアカウントの存在しない所属先を整理する。
   * 同一アカウントで複数端末から同時に追加・削除する操作は保証対象外とする。
   * @param ownerId 今回の一覧取得が完了したアカウント
   */
  async reconcileMissingGroups(state: CubeOperationState, ownerId: string): Promise<void> {
    const knownIds = new Set(
      [...DEFAULT_GROUPS, ...state.userGroups().filter((group) => !group.deletedAt)].map(
        (group) => group.id,
      ),
    );
    const missingGroupIds = new Set(
      state
        .storedSolves()
        .filter(
          (solve) => solve.ownerType === 'account' && solve.ownerId === ownerId && !solve.deletedAt,
        )
        .map((solve) => solve.groupId)
        .filter((groupId): groupId is string => !!groupId && !knownIds.has(groupId)),
    );
    await this.moveSolvesToDefault(state, missingGroupIds, ownerId);
  }

  /** 削除を確認できたグループの所属を整理する。起動時には未取得を削除と判断しない。
   * @param deletedGroup 削除状態を確認するグループ台帳
   */
  async reconcileDeletedGroups(
    state: CubeOperationState,
    deletedGroup: readonly RecordGroup[] = state.userGroups(),
  ): Promise<void> {
    const ids = new Set(deletedGroup.filter((group) => group.deletedAt).map((group) => group.id));
    await this.moveSolvesToDefault(state, ids);
  }

  /** 対象グループの有効な記録だけを未分類へ移し、削除済み記録の再保存を防ぐ。
   * @param groupIds 所属を解除するグループID
   * @param ownerId 不明な所属を整理する場合の対象アカウント
   */
  private async moveSolvesToDefault(
    state: CubeOperationState,
    groupIds: ReadonlySet<string>,
    ownerId?: string,
  ): Promise<void> {
    const moved = state
      .storedSolves()
      .filter(
        (solve) =>
          !solve.deletedAt &&
          solve.groupId !== DEFAULT_GROUP.id &&
          !!solve.groupId &&
          groupIds.has(solve.groupId) &&
          (!ownerId || (solve.ownerType === 'account' && solve.ownerId === ownerId)),
      )
      .map((solve) => ({ ...solve, groupId: DEFAULT_GROUP.id }));
    if (moved.length) {
      const byId = new Map(moved.map((solve) => [solve.id, solve]));
      state.storedSolves.update((solves) => solves.map((solve) => byId.get(solve.id) ?? solve));
      await Promise.all(moved.map((solve) => this.userDataRepository.putSolve(solve)));
    }
    if (groupIds.has(state.activeGroupId())) state.activeGroupId.set(DEFAULT_GROUP.id);
  }
}
