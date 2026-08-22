import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { DialogButtons } from './confirm-dialog.buttons';
import { ConfirmDialog } from './confirm-dialog';
import { ConfirmDialogData, ConfirmDialogResult } from './confirm-dialog.models';

/** 操作の意図に応じた共通設定で確認ダイアログを表示するサービス。 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  /** Angular Materialのダイアログを表示するサービス。 */
  private readonly dialog = inject(MatDialog);

  /**
   * 安全なキャンセル操作へ初期フォーカスを置いた削除確認を表示する。
   *
   * @param title ダイアログのタイトル
   * @param message 削除対象を説明する本文
   * @returns 削除が選択された場合に`true`を通知するObservable
   */
  delete(title: string, message: string): Observable<boolean> {
    const data = {
      title,
      message,
      buttons: [DialogButtons.cancel, DialogButtons.delete],
      defaultFocus: DialogButtons.cancel.id,
    } as const satisfies ConfirmDialogData;

    return this.dialog
      .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, { data })
      .afterClosed()
      .pipe(map((result) => result === DialogButtons.delete.id));
  }
}
