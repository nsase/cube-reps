import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { GOOGLE_SIGN_IN_AVAILABLE } from '../../../core/platform/native-platform';
import { AuthService } from '../../../core/auth/auth.service';

/** GoogleブランドのボタンからGoogle認証を開始する。 */
@Component({
  selector: 'app-google-button',
  imports: [MatButtonModule, MatIconModule, TranslocoPipe],
  templateUrl: './google-button.html',
  styleUrl: './google-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleButton {
  /** このアプリでGoogleログインを利用できるか。 */
  protected readonly available = inject(GOOGLE_SIGN_IN_AVAILABLE);
  /** 認証操作と現在のアカウント状態。 */
  protected readonly auth = inject(AuthService);
}
