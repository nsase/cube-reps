import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogData } from './confirm-dialog.models';

/** 渡された本文とボタン配列を表示する汎用確認ダイアログ。 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [A11yModule, MatButtonModule, MatDialogModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  /** 呼び出し元から渡されたダイアログ表示データ。 */
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
