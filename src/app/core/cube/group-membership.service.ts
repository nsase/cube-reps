import { Injectable, inject } from '@angular/core';
import { SolveService } from './solve.service';
import { GroupService } from './group.service';
import { RecordGroup } from './cube.models';
import { DEFAULT_GROUP, DEFAULT_GROUPS } from './default-groups';
import { UserDataRepository } from '../local-storage/user-data-repository';

/** グループ削除と記録の所属移動を調整し、両ドメインの整合性を守る。 */
@Injectable({ providedIn: 'root' })
export class GroupMembershipService {
  /** 所属を変更する記録の所有者。 */
  private readonly solves = inject(SolveService);
  /** グループ台帳と画面間で共有する選択状態の所有者。 */
  private readonly groups = inject(GroupService);
  /** 同期で整理した所属の保存先。 */
  private readonly userDataRepository = inject(UserDataRepository);

  /**
   * 指定したユーザー作成グループを削除し、所属する記録を未分類へ移動する。既定グループは削除しない。
   * グループ整理で計測記録を失わず、削除後も履歴と集計から参照できる状態を守る。
   *
   * @param id 削除対象のグループID
   */
  removeGroup(id: string): void {
    // 既定グループは削除しない
    if (DEFAULT_GROUPS.some((group) => group.id === id)) return;

    // ほかアカウントのデータが混ざっている場合は削除しない(Guestデータの場合は削除可能)
    if (!this.groups.canManageGroup(id)) return;

    // 削除対象グループを取得（取得できない場合は削除処理は中止）
    const group = this.groups.userGroups().find((group) => group.id === id);
    if (!group) return;

    // 削除するグループに属する計測記録を「未分類」へ移動する
    const now = new Date().toISOString();
    const affectedSolves = this.solves
      .storedSolves()
      .filter((solve) => solve.groupId === id)
      .map((solve) => ({
        ...solve,
        groupId: DEFAULT_GROUP.id,
        updatedAt: now,
        pendingSync: solve.ownerType === 'account',
      }));
    const affectedById = new Map(affectedSolves.map((solve) => [solve.id, solve]));
    this.solves.storedSolves.update((solves) =>
      solves.map((solve) => affectedById.get(solve.id) ?? solve),
    );

    // グループを削除
    const deleted = {
      ...group,
      updatedAt: now,
      deletedAt: now,
      pendingSync: group.ownerType === 'account',
    };
    this.groups.userGroups.update((groups) =>
      groups.map((item) => (item.id === id ? deleted : item)),
    );

    // 計測記録の変更を通知（DBへの保存などを行う）
    this.solves.solveChange$.next(affectedSolves);

    // グループの変更を通知（DBへの保存などを行う）
    this.groups.groupChange$.next(deleted);

    // 削除したグループが現在のアクティブグループだった場合は、未分類を選択する
    if (this.groups.activeGroupId() === id) this.groups.activeGroupId.set(DEFAULT_GROUP.id);
  }

  /** GroupとSolveの取得成功後、現在のアカウントの存在しない所属先を整理する。
   * 同一アカウントで複数端末から同時に追加・削除する操作は保証対象外とする。
   * @param ownerId 今回の一覧取得が完了したアカウント
   */
  async reconcileMissingGroups(ownerId: string): Promise<void> {
    const knownIds = new Set(
      [...DEFAULT_GROUPS, ...this.groups.userGroups().filter((group) => !group.deletedAt)].map(
        (group) => group.id,
      ),
    );
    const missingGroupIds = new Set(
      this.solves
        .storedSolves()
        .filter(
          (solve) => solve.ownerType === 'account' && solve.ownerId === ownerId && !solve.deletedAt,
        )
        .map((solve) => solve.groupId)
        .filter((groupId): groupId is string => !!groupId && !knownIds.has(groupId)),
    );
    await this.moveSolvesToDefault(missingGroupIds, ownerId);
  }

  /** 削除を確認できたグループの所属を整理する。起動時には未取得を削除と判断しない。
   * @param deletedGroup 削除状態を確認するグループ台帳
   */
  async reconcileDeletedGroups(
    deletedGroup: readonly RecordGroup[] = this.groups.userGroups(),
  ): Promise<void> {
    const ids = new Set(deletedGroup.filter((group) => group.deletedAt).map((group) => group.id));
    await this.moveSolvesToDefault(ids);
  }

  /** 対象グループの有効な記録だけを未分類へ移し、削除済み記録の再保存を防ぐ。
   * @param groupIds 所属を解除するグループID
   * @param ownerId 不明な所属を整理する場合の対象アカウント
   */
  private async moveSolvesToDefault(
    groupIds: ReadonlySet<string>,
    ownerId?: string,
  ): Promise<void> {
    const moved = this.solves
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
      this.solves.storedSolves.update((solves) =>
        solves.map((solve) => byId.get(solve.id) ?? solve),
      );
      await Promise.all(moved.map((solve) => this.userDataRepository.putSolve(solve)));
    }
    if (groupIds.has(this.groups.activeGroupId())) this.groups.activeGroupId.set(DEFAULT_GROUP.id);
  }
}
