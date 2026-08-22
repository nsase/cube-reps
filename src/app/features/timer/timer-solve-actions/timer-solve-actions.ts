import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { DialogButtons } from '../../../shared/confirm-dialog/confirm-dialog.buttons';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../shared/confirm-dialog/confirm-dialog.models';
import { TimerStore } from '../timer.store';

/** 直前の計測結果に対する削除・ペナルティ・再試行操作を表示する。 */
@Component({
  selector: 'app-timer-solve-actions',
  imports: [MatButtonModule, MatIconModule, TranslocoPipe],
  templateUrl: './timer-solve-actions.html',
  styleUrl: './timer-solve-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerSolveActions {
  /** Timerコンポーネントツリー内で共有する計測状態。 */
  protected readonly store = inject(TimerStore);
  /** 記録削除の確認を表示するMaterial Dialogサービス。 */
  private readonly dialog = inject(MatDialog);
  /** 確認メッセージを現在の言語へ翻訳するサービス。 */
  private readonly i18n = inject(TranslocoService);

  /** 確認後に直前の計測結果を削除する。 */
  protected delete(event: MouseEvent): void {
    this.blurButton(event);
    const data = {
      title: this.i18n.translate('timer.deleteSolveTitle'),
      message: this.i18n.translate('timer.deleteSolveMessage'),
      buttons: [DialogButtons.cancel, DialogButtons.delete],
      defaultFocus: DialogButtons.cancel.id,
    } as const satisfies ConfirmDialogData;

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, {
        data,
        restoreFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === DialogButtons.delete.id) this.store.removeCompletedSolve();
      });
  }

  /** ペナルティを切り替え、次のSpace操作をタイマーで受け取れるようにする。 */
  protected togglePenalty(penalty: 'DNF' | '+2', event: MouseEvent): void {
    this.store.toggleCompletedPenalty(penalty);
    this.blurButton(event);
  }

  /** 同じスクランブルを再設定し、操作ボタンからフォーカスを外す。 */
  protected retry(event: MouseEvent): void {
    this.store.retryCompletedSolve();
    this.blurButton(event);
  }

  /** 操作後のSpace入力がボタンの再実行にならないようフォーカスを解除する。 */
  private blurButton(event: MouseEvent): void {
    (event.currentTarget as HTMLButtonElement).blur();
  }
}
