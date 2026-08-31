import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppUpdateService } from '../../core/app-update.service';

/** 取得済みの新版へ切り替える操作を画面下部へ表示するコンポーネント。 */
@Component({
  selector: 'app-update',
  imports: [MatButtonModule, TranslocoPipe],
  templateUrl: './app-update.html',
  styleUrl: './app-update.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppUpdate {
  /** 新版の取得状態と適用操作を提供するサービス。 */
  protected readonly updates = inject(AppUpdateService);
}
