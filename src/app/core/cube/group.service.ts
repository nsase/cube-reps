import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { translateSignal } from '@jsverse/transloco';
import { SolveService } from './solve.service';
import { DisplayRecordGroup, RecordGroup } from './cube.models';
import {
  USER_DATA_SCHEMA_VERSION,
  UserDataRepository,
} from '../local-storage/user-data-repository';
import { DEFAULT_GROUP, DEFAULT_GROUPS } from './default-groups';
import { remoteWins, isLatestSyncData } from './sync-policy';

/** グループ台帳と共有の選択状態を所有し、編集・所有権・同期反映を担当する。 */
@Injectable({ providedIn: 'root' })
export class GroupService {
  /** 操作を許可する現在のアカウント。 */
  private readonly auth = inject(AuthService);
  /** 操作結果の永続化先。 */
  private readonly userDataRepository = inject(UserDataRepository);

  /** 未取得グループの表示と編集権限の判定に使用する記録。 */
  private readonly solves = inject(SolveService);

  /** 作成順に保持し、IndexedDBへ保存するユーザー作成グループ。 */
  readonly userGroups = signal<RecordGroup[]>([]);
  /** 別端末から取得した、台帳にないグループの表示名。 */
  private readonly savedGroupLabel = translateSignal('ownership.savedGroup');
  /**
   *  有効なグループの一覧。
   * リモートの計測記録がIndexedDBにないグループを参照している場合、group.idをグループ名として表示する。
   */
  readonly activeGroups = computed<DisplayRecordGroup[]>(() => {
    const groups: DisplayRecordGroup[] = [
      ...DEFAULT_GROUPS,
      ...this.userGroups().filter((group) => !group.deletedAt),
    ];
    const knownGroupIds = new Set([...groups, ...this.userGroups()].map((group) => group.id));
    for (const solve of this.solves.activeSolves()) {
      if (!solve.groupId || knownGroupIds.has(solve.groupId)) continue;
      knownGroupIds.add(solve.groupId);
      groups.push({
        id: solve.groupId,
        name: `${this.savedGroupLabel()} (${solve.groupId})`,
        createdAt: solve.createdAt,
        updatedAt: solve.updatedAt,
        ownerType: solve.ownerType,
        ...(solve.ownerId ? { ownerId: solve.ownerId } : {}),
        schemaVersion: USER_DATA_SCHEMA_VERSION,
      });
    }
    return groups;
  });
  /** 現在の記録先グループID。 */
  readonly activeGroupId = signal(this.loadActiveGroupId());
  /** 現在の記録先グループ。 */
  readonly activeGroup = computed(
    () =>
      this.activeGroups().find((group) => group.id === this.activeGroupId()) ??
      this.activeGroups()[0],
  );
  /** アプリ定義グループIDに対応する、ロード完了後の翻訳済み表示名。 */
  private readonly defaultGroupNames = new Map<string, Signal<string>>(
    DEFAULT_GROUPS.flatMap((group) =>
      'nameKey' in group ? [[group.id, translateSignal(group.nameKey)] as const] : [],
    ),
  );

  /** グループの変更を永続化・同期へ通知する。 */
  readonly groupChange$ = new Subject<RecordGroup>();

  /** HistoryとTimerで共有する選択を端末に保存する。 */
  constructor() {
    effect(() => localStorage.setItem('cube-reps.active-group', this.activeGroupId()));
  }

  /**
   * グループIDに対応する表示名を返す。
   *
   * @param groupId 検索するグループID
   * @returns グループ名。見つからない場合は既定グループ名
   */
  groupName(groupId?: string): string {
    const group = this.activeGroups().find(({ id }) => id === groupId) ?? DEFAULT_GROUP;
    return this.defaultGroupNames.get(group.id)?.() ?? group.name;
  }

  /** @returns 保存済みの記録先ID。未設定時は既定グループID */
  private loadActiveGroupId(): string {
    const stored = localStorage.getItem('cube-reps.active-group');
    return stored || DEFAULT_GROUP.id;
  }

  /**
   * クラウドから受信したグループを端末へ反映する。
   * 別端末の変更を再起動後も保持するためIndexedDBへ保存し、受信した削除はStoreとIndexedDBから除去する。
   * @returns 所属整理で削除を確認する台帳。変更がない場合も受信した削除を返す。
   */
  async mergeGroups(remoteGroups: readonly RecordGroup[]): Promise<readonly RecordGroup[]> {
    const currentGroups = this.userGroups();
    const groupsById = new Map(currentGroups.map((group) => [group.id, group]));
    const changedGroups: RecordGroup[] = [];
    for (const remote of remoteGroups) {
      const local = groupsById.get(remote.id);
      if (!remoteWins(local, remote)) continue;
      groupsById.set(remote.id, remote);
      changedGroups.push(remote);
    }
    if (changedGroups.length === 0) {
      return remoteGroups;
    }

    // storeを更新
    this.userGroups.set(
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

    return deletedGroups;
  }

  /**
   * この端末からクラウドへのグループ送信成功を反映する。
   * 再起動後の不要な再送を防ぐためpendingSyncを解除し、削除済みならStoreとIndexedDBから除去する。
   *
   * @param group クラウドへの送信が成功したグループの版
   */
  async groupSyncFinished(group: RecordGroup): Promise<void> {
    const current = this.userGroups().find((g) => g.id === group.id);
    if (!current || !isLatestSyncData(current, group)) return;

    const { pendingSync: _pending, ...saved } = group;
    this.userGroups.update((groups) =>
      saved.deletedAt
        ? groups.filter((g) => g.id !== saved.id)
        : groups.map((g) => (g.id === saved.id ? saved : g)),
    );
    if (saved.deletedAt) await this.userDataRepository.deleteRecordGroup(saved.id);
    else await this.userDataRepository.putRecordGroup(saved);
  }

  /** 選択した未紐づけ記録グループを現在のアカウントへ移し、保存後に同期キューへ渡す。 */
  assignGroupToAccount(group: RecordGroup, accountId: string): void {
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
    this.userGroups.update((groups) =>
      groups.map((item) => (item.id === group.id ? updated : item)),
    );

    // 記録グループの変更を通知（DBへの保存などを行う）
    this.groupChange$.next(updated);
  }

  /**
   * 記録グループを作成して記録先に設定する。
   *
   * @param name 作成するグループ名
   * @returns 作成したグループ。空白名の場合は`undefined`
   */
  addGroup(name: string): RecordGroup | undefined {
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
    this.userGroups.update((groups) => [...groups, group]);

    // 作成したグループをアクティブな記録先に設定
    this.activeGroupId.set(group.id);

    // グループの変更を通知（DBへの保存などを行う）
    this.groupChange$.next(group);
    return group;
  }

  /**
   * ユーザー作成グループの名前を変更する。既定グループは変更しない。
   *
   * @param id 名前を変更するグループID
   * @param name 新しいグループ名
   * @returns 名前を変更できた場合は`true`
   */
  renameGroup(id: string, name: string): boolean {
    // 名前が空だった場合やデフォルトグループだった場合は名前を変更しない
    const trimmedName = name.trim();
    if (!trimmedName || DEFAULT_GROUPS.some((group) => group.id === id)) return false;

    // ほかアカウントのデータが混ざっている場合は変更しない(Guestデータの場合は変更可能)
    const current = this.userGroups().find((group) => group.id === id);
    if (!current || !this.canManageGroup(id)) return false;

    // グループ名を更新
    const updated = {
      ...current,
      pendingSync: current.ownerType === 'account',
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    };
    this.userGroups.update((groups) => groups.map((group) => (group.id === id ? updated : group)));

    // グループの変更を通知（DBへの保存などを行う）
    this.groupChange$.next(updated);
    return true;
  }

  /** 別アカウントの記録を間接的にも変更しないグループ操作だけを許可する。 */
  canManageGroup(id: string): boolean {
    const group = this.userGroups().find((group) => group.id === id);
    return Boolean(
      group &&
      !group.deletedAt &&
      (group.ownerType === 'guest' ||
        Boolean(group.ownerId && group.ownerId === this.auth.user()?.uid)) &&
      this.solves
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
}
