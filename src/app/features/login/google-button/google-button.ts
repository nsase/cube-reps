import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
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
  /** 認証操作と現在のアカウント状態。 */
  protected readonly auth = inject(AuthService);
}
