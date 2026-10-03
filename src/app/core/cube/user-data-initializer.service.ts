import { Injectable, inject, signal } from '@angular/core';
import { AccountStore } from '../account.store';
import { UserDataRepository } from '../local-storage/user-data-repository';
import { SolveService } from './solve.service';
import { GroupService } from './group.service';
import { GroupMembershipService } from './group-membership.service';
import { DEFAULT_GROUP } from './default-groups';

/** 端末データを各所有者へ一度だけ復元し、削除済みデータの整合性を整える。 */
@Injectable({ providedIn: 'root' })
export class UserDataInitializer {
  /** 記録の復元先。 */
  private readonly solves = inject(SolveService);
  /** グループと選択状態の復元先。 */
  private readonly groups = inject(GroupService);
  /** 起動時の削除済みグループに対する所属整理。 */
  private readonly membership = inject(GroupMembershipService);
  /** アカウントの復元先。 */
  private readonly accountStore = inject(AccountStore);
  /** 端末データの読み取りと不要データの除去を担う境界。 */
  private readonly userDataRepository = inject(UserDataRepository);
  /** すべての復元・整理が完了したことを通知する。 */
  readonly storageReady = signal(false);
  /** 同時に利用する画面と同期処理が共有する初期化Promise。 */
  readonly ready = this.initializeStorage();

  /**
   * IndexedDBから保存されているデータをロードする。
   * ロード完了前にデータが登録されている場合は、IndexedDBのデータとマージする。
   */
  private async initializeStorage(): Promise<void> {
    const stored = await this.userDataRepository.load();

    // IndexedDBから取得したアカウント情報をストアへセットし、セット前にブラウザ上で作成されたアカウントがあればマージする
    this.accountStore.load(stored.accounts);

    // IndexedDBから取得した計測記録をストアへセットし、セット前にブラウザ上で作成された計測記録がればマージする
    this.solves.storedSolves.update((current) => {
      const currentIds = new Set(current.map(({ id }) => id));
      return [...current, ...stored.solves.filter(({ id }) => !currentIds.has(id))];
    });
    // IndexedDBから取得した記録グループをストアへセットし、セット前にブラウザ上で作成された記録グループがあればマージする
    this.groups.userGroups.update((current) => {
      const currentGroupIds = new Set(current.map(({ id }) => id));
      return [...current, ...stored.groups.filter(({ id }) => !currentGroupIds.has(id))];
    });

    // アクティブなグループとして設定されているグループが存在しなかった場合は、既定グループを選択する
    if (!this.groups.activeGroups().some(({ id }) => id === this.groups.activeGroupId())) {
      this.groups.activeGroupId.set(DEFAULT_GROUP.id);
    }

    // 削除済みグループに所属する計測記録を未分類グループへ移動する
    await this.membership.reconcileDeletedGroups();

    // 旧版が保持した送信済みtombstoneを除去し、未送信の削除だけを再送用に残す。
    const deletedSolves = this.solves
      .storedSolves()
      .filter((solve) => solve.deletedAt && !solve.pendingSync);
    const deletedGroups = this.groups
      .userGroups()
      .filter((group) => group.deletedAt && !group.pendingSync);
    this.solves.storedSolves.update((solves) =>
      solves.filter((solve) => !solve.deletedAt || solve.pendingSync),
    );
    this.groups.userGroups.update((groups) =>
      groups.filter((group) => !group.deletedAt || group.pendingSync),
    );
    await Promise.all([
      ...deletedSolves.map((solve) => this.userDataRepository.deleteSolve(solve.id)),
      ...deletedGroups.map((group) => this.userDataRepository.deleteRecordGroup(group.id)),
    ]);

    // データのロードが完了し、データが更新可能な状態になったことを通知する
    this.storageReady.set(true);
  }
}
