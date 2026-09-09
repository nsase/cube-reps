import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { GoogleButton } from './google-button/google-button';

/** ログイン方法を選び、認証の進行状況と結果を確認する画面。 */
@Component({
  selector: 'app-login',
  imports: [MatButtonModule, RouterLink, TranslocoPipe, GoogleButton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  /** 認証操作と現在のアカウント状態。 */
  protected readonly auth = inject(AuthService);
}
