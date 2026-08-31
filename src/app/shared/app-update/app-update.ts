import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { AppUpdateService } from '../../core/app-update.service';
import { AppUpdateSnackbar } from '../app-update-snackbar/app-update-snackbar';

/** 新版の取得状態に合わせて更新用Snack Barを表示・終了するコンポーネント。 */
@Component({
  selector: 'app-update',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppUpdate {
  /** 新版の取得状態と通知の表示可否を提供するサービス。 */
  private readonly updates = inject(AppUpdateService);
  /** 更新通知をオーバーレイへ表示するMaterial Snack Bar。 */
  private readonly snackBar = inject(MatSnackBar);
  /** 現在表示している更新通知。 */
  private snackBarRef?: MatSnackBarRef<AppUpdateSnackbar>;

  /** 更新可能かつ主要操作を妨げない間だけSnack Barを表示する副作用。 */
  private readonly updateNoticeEffect = effect(() => {
    if (this.updates.showUpdateNotice()) {
      if (!this.snackBarRef) {
        const snackBarRef = this.snackBar.openFromComponent(AppUpdateSnackbar, {
          duration: undefined,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: 'app-update-snackbar-container',
        });
        this.snackBarRef = snackBarRef;
        snackBarRef.afterDismissed().subscribe(() => {
          if (this.snackBarRef === snackBarRef) this.snackBarRef = undefined;
        });
      }
      return;
    }

    this.snackBarRef?.dismiss();
    this.snackBarRef = undefined;
  });
}
