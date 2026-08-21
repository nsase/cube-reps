import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CubeService } from '../../core/cube';
import { DialogButtons } from '../../shared/confirm-dialog/confirm-dialog.buttons';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../shared/confirm-dialog/confirm-dialog.models';
import { CubeNetView } from '../../shared/cube-net/cube-net';

/** 計測履歴と記録グループの管理画面。 */
@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, CubeNetView],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  /** タイマー画面への遷移を親コンポーネントへ通知する。 */
  readonly showTimer = output<void>();

  /** 計測記録とグループを操作するサービス。 */
  protected readonly cube = inject(CubeService);
  /** 削除確認を表示するMaterial Dialogサービス。 */
  private readonly dialog = inject(MatDialog);

  /** 履歴の絞り込み対象。`all`の場合は全グループを表示する。 */
  protected readonly selectedGroup = signal('all');

  /** グループ作成フォームの表示状態。 */
  protected readonly showCreateForm = signal(false);

  /** 作成中のグループ名。 */
  protected readonly newGroupName = signal('');

  /** 選択中のグループに属する計測記録。 */
  protected readonly filteredSolves = computed(() => {
    const groupId = this.selectedGroup();
    return groupId === 'all'
      ? this.cube.solves()
      : this.cube.solves().filter((solve) => solve.groupId === groupId);
  });

  /** 集計対象となるDNF以外の計測記録。 */
  protected readonly filteredValidSolves = computed(() =>
    this.filteredSolves().filter((solve) => solve.penalty !== 'DNF'),
  );

  /** 絞り込み対象内のベストタイム。記録がない場合は`Infinity`。 */
  protected readonly filteredBest = computed(() =>
    Math.min(...this.filteredValidSolves().map((solve) => this.cube.finalTime(solve)), Infinity),
  );

  /** 絞り込み対象内にある直近5件の有効記録の平均タイム。 */
  protected readonly filteredAverage = computed(() => {
    const times = this.filteredValidSolves()
      .slice(0, 5)
      .map((solve) => this.cube.finalTime(solve));
    return times.length ? times.reduce((total, time) => total + time, 0) / times.length : Infinity;
  });

  /** 入力された名前でグループを作成し、作成したグループを選択する。 */
  protected createGroup(): void {
    const group = this.cube.addGroup(this.newGroupName());
    if (!group) return;
    this.selectedGroup.set(group.id);
    this.newGroupName.set('');
    this.showCreateForm.set(false);
  }

  /**
   * 確認後に指定されたグループを削除する。
   *
   * @param id 削除対象のグループID
   */
  protected deleteGroup(id: string): void {
    const group = this.cube.groups().find((candidate) => candidate.id === id);
    if (!group) return;

    this.confirmDelete(
      'グループを削除しますか？',
      `「${group.name}」を削除します。\nこの操作は取り消せません。`,
      () => {
        this.cube.removeGroup(id);
        if (this.selectedGroup() === id) this.selectedGroup.set('all');
      },
    );
  }

  /**
   * 確認後に指定された計測記録を削除する。
   *
   * @param id 削除対象の計測記録ID
   */
  protected deleteSolve(id: number): void {
    this.confirmDelete(
      '記録を削除しますか？',
      '選択した計測記録を削除します。\nこの操作は取り消せません。',
      () => this.cube.removeSolve(id),
    );
  }

  /**
   * 削除確認ダイアログを開き、削除が選択された場合だけ処理を実行する。
   *
   * @param title ダイアログのタイトル
   * @param message 削除対象を説明するメッセージ
   * @param onConfirm 削除が選択された場合に実行する処理
   */
  private confirmDelete(title: string, message: string, onConfirm: () => void): void {
    const data = {
      title,
      message,
      buttons: [DialogButtons.cancel, DialogButtons.delete],
      defaultFocus: DialogButtons.cancel.id,
    } as const satisfies ConfirmDialogData;

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result === DialogButtons.delete.id) onConfirm();
      });
  }
}
