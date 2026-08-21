import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CubeService } from '../../../../core/cube';
import { RecordGroup as RecordGroupModel } from '../../../../core/cube.models';
import { DialogButtons } from '../../../../shared/confirm-dialog/confirm-dialog.buttons';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../../shared/confirm-dialog/confirm-dialog.models';
import { HistoryStore } from '../../history.store';

/** 1件の記録グループと、その選択・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-record-group',
  imports: [MatButtonModule, MatIconModule],
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
  /** グループ削除の確認を表示するMaterial Dialogサービス。 */
  private readonly dialog = inject(MatDialog);

  /** このグループが履歴の絞り込み対象として選択されているか。 */
  protected readonly isActive = computed(() => this.store.selectedGroup() === this.group().id);
  /** このグループに属する計測記録の件数。 */
  protected readonly solveCount = computed(
    () => this.cube.solves().filter((solve) => solve.groupId === this.group().id).length,
  );
  /** このグループを削除できるか。 */
  protected readonly canDelete = computed(
    () => this.group().id !== 'unclassified' && this.cube.groups().length > 1,
  );

  /** このグループを履歴の絞り込み対象に設定する。 */
  protected select(): void {
    this.store.selectedGroup.set(this.group().id);
  }

  /** 確認後にこのグループを削除する。 */
  protected delete(): void {
    const group = this.group();
    const data = {
      title: 'グループを削除しますか？',
      message: `「${group.name}」を削除します。\nこの操作は取り消せません。`,
      buttons: [DialogButtons.cancel, DialogButtons.delete],
      defaultFocus: DialogButtons.cancel.id,
    } as const satisfies ConfirmDialogData;

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result !== DialogButtons.delete.id) return;
        this.cube.removeGroup(group.id);
        if (this.store.selectedGroup() === group.id) this.store.selectedGroup.set('all');
      });
  }
}
