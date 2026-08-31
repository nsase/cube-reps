import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppUpdateService } from '../../core/app-update.service';

/** 新版の適用または通知の終了を選べるSnack Barコンテンツ。 */
@Component({
  selector: 'app-update-snackbar',
  imports: [MatButtonModule, MatIconModule, MatSnackBarModule, TranslocoPipe],
  templateUrl: './app-update-snackbar.html',
  styleUrl: './app-update-snackbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppUpdateSnackbar {
  /** 新版の適用と通知の既読状態を管理するサービス。 */
  protected readonly updates = inject(AppUpdateService);
  /** 現在表示しているSnack Barを閉じるための参照。 */
  private readonly snackBarRef = inject(MatSnackBarRef<AppUpdateSnackbar>);

  /** 通知を閉じ、同じバージョンを現在の起動中は再通知しない。 */
  protected dismiss(): void {
    this.updates.dismissUpdate();
    this.snackBarRef.dismiss();
  }

  /** 待機中の新版を適用する。 */
  protected applyUpdate(): void {
    void this.updates.applyUpdate();
  }
}
