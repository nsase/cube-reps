import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CubeService } from '../../../../core/cube/cube';
import { DisplayRecordGroup as RecordGroupModel, SyncMetadata } from '../../../../core/cube/cube.models';
import { ConfirmService } from '../../../../shared/confirm-dialog/confirm.service';
import { OwnerAvatar } from '../../../../shared/owner-avatar/owner-avatar';
import { HistoryStore } from '../../history.store';

/** 1件の記録グループと、その選択・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-record-group',
  imports: [FormsModule, MatButtonModule, MatIconModule, TranslocoPipe, OwnerAvatar],
  templateUrl: './record-group.html',
  styleUrl: './record-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.active]': 'isActive()',
  },
})
export class RecordGroup {
  /** 表示する記録グループ。 */
  readonly group = input.required<RecordGroupModel>();

  /** 記録とグループを操作するサービス。 */
  protected readonly cube = inject(CubeService);
  /** Historyコンポーネントツリー内で共有する画面状態。 */
  private readonly store = inject(HistoryStore);
  /** グループ削除の確認を表示するサービス。 */
  private readonly confirm = inject(ConfirmService);
  /** 確認メッセージを現在の言語へ翻訳するサービス。 */
  private readonly i18n = inject(TranslocoService);
  /** 名前変更フォームを表示しているか。 */
  protected readonly editing = signal(false);
  /** 編集中のグループ名。 */
  protected readonly editedName = signal('');

  /** このグループが履歴の絞り込み対象として選択されているか。 */
  protected readonly isActive = computed(() => this.store.selectedGroup() === this.group().id);
  /** このグループに属する計測記録の件数。 */
  protected readonly solveCount = computed(
    () =>
      this.store
        .ownerSolves()
        .filter((solve) => (solve.groupId || 'unclassified') === this.group().id).length,
  );
  /** このグループの名前を変更できるか。 */
  protected readonly canEdit = computed(() => this.cube.canManageGroup(this.group().id));
  /** このグループを削除できるか。 */
  protected readonly canDelete = computed(
    () => this.cube.canManageGroup(this.group().id) && this.cube.activeGroups().length > 1,
  );

  /** このグループを履歴の絞り込み対象に設定する。 */
  protected select(): void {
    this.store.selectedGroup.set(this.group().id);
  }

  /** 現在の名前を入力欄へ設定して名前変更を開始する。 */
  protected startEditing(): void {
    if (!this.canEdit()) return;
    this.editedName.set(this.group().name);
    this.editing.set(true);
  }

  /** 入力した名前を保存して名前変更を終了する。 */
  protected rename(): void {
    if (!this.cube.renameGroup(this.group().id, this.editedName())) return;
    this.editing.set(false);
  }

  /** 入力内容を破棄して名前変更を終了する。 */
  protected cancelEditing(): void {
    this.editedName.set('');
    this.editing.set(false);
  }

  /** このグループがビルトインかどうかを判定する。 */
  protected isBuiltIn(group: RecordGroupModel): boolean {
    return !('ownerType' in group);
  }

  /** GroupのMetadataを返す */
  protected getMetadata(group: RecordGroupModel): SyncMetadata {
    return group as SyncMetadata;
  }

  /** 確認後にこのグループを削除する。 */
  protected delete(): void {
    const group = this.group();
    this.confirm
      .delete(
        this.i18n.translate('history.deleteGroupTitle'),
        this.i18n.translate('history.deleteGroupMessage', {
          name: group.name,
          count: this.solveCount(),
        }),
      )
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.cube.removeGroup(group.id);
      });
  }
}
