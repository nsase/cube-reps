import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { DialogButtons } from '../../../../shared/confirm-dialog/confirm-dialog.buttons';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../../shared/confirm-dialog/confirm-dialog.models';
import { CubeNetView } from '../../../../shared/cube-net/cube-net';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** 1件の計測記録と、そのペナルティ・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-solve-record',
  imports: [CommonModule, MatButtonModule, MatIconModule, CubeNetView, TranslocoPipe],
  templateUrl: './solve-record.html',
  styleUrl: './solve-record.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveRecord {
  /** 表示する計測記録。 */
  readonly solve = input.required<Solve>();
  /** 履歴一覧に表示する通し番号。 */
  readonly recordNumber = input.required<number>();

  /** 計測記録の表示と更新を行うサービス。 */
  protected readonly cube = inject(CubeService);
  /** 記録削除の確認を表示するMaterial Dialogサービス。 */
  private readonly dialog = inject(MatDialog);
  /** 確認メッセージを現在の言語へ翻訳するサービス。 */
  private readonly i18n = inject(TranslocoService);

  /** 確認後にこの計測記録を削除する。 */
  protected delete(): void {
    const data = {
      title: this.i18n.translate('history.deleteSolveTitle'),
      message: this.i18n.translate('history.deleteSolveMessage'),
      buttons: [DialogButtons.cancel, DialogButtons.delete],
      defaultFocus: DialogButtons.cancel.id,
    } as const satisfies ConfirmDialogData;

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result === DialogButtons.delete.id) this.cube.removeSolve(this.solve().id);
      });
  }
}
