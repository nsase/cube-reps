import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';

/** ヘッダーでGoogleアカウントのログイン状態と操作を表示する。 */
@Component({
  selector: 'app-auth-controls',
  imports: [MatButtonModule, MatIconModule, TranslocoPipe],
  templateUrl: './auth-controls.html',
  styleUrl: './auth-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthControls {
  /** アプリ全体で共有する認証状態と操作。 */
  protected readonly auth = inject(AuthService);

  /** Googleアカウントでのログインを開始する。 */
  protected async signIn(): Promise<void> {
    await this.auth.signIn();
  }

  /** 現在のGoogleアカウントからログアウトする。 */
  protected async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}
