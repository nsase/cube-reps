import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CubeService } from '../../../../core/cube';
import { RecordGroup as RecordGroupModel } from '../../../../core/cube.models';
import { ConfirmService } from '../../../../shared/confirm-dialog/confirm.service';
import { HistoryStore } from '../../history.store';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** 1件の記録グループと、その選択・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-record-group',
  imports: [MatButtonModule, MatIconModule, TranslocoPipe],
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
    this.confirm
      .delete(
        this.i18n.translate('history.deleteGroupTitle'),
        this.i18n.translate('history.deleteGroupMessage', { name: group.name }),
      )
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.cube.removeGroup(group.id);
        if (this.store.selectedGroup() === group.id) this.store.selectedGroup.set('all');
      });
  }
}
