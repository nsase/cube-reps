import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { AppUpdateService } from '../../core/app-update.service';

/** ヘッダーのプロフィールからアカウント情報と認証操作を開く。 */
@Component({
  selector: 'app-auth-controls',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, RouterLink, TranslocoPipe],
  templateUrl: './auth-controls.html',
  styleUrl: './auth-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthControls {
  /** アプリ全体で共有する認証状態と操作。 */
  protected readonly auth = inject(AuthService);
  /** 計測中に補助UIを抑止する状態。 */
  protected readonly updates = inject(AppUpdateService);
  /** 読み込めなかった画像URL。別の画像になれば再表示を試みる。 */
  protected readonly failedPhoto = signal<string | null>(null);
  /** 開いているプロフィールメニューの操作口。 */
  private readonly menu = viewChild(MatMenuTrigger);
  /** 計測開始時はオーバーレイを閉じ、停止操作を妨げない。 */
  private readonly closeDuringTiming = effect(() => {
    if (!this.updates.showNonEssentialNotices()) this.menu()?.closeMenu();
  });

  /** 現在のアカウントからログアウトする。失敗時はメニューを再表示する。 */
  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    if (this.auth.failed() && this.updates.showNonEssentialNotices()) this.menu()?.openMenu();
  }
}
