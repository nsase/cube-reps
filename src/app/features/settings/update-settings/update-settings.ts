import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppUpdateService } from '../../../core/app-update.service';

/** 更新通知を閉じた後でも新版の確認・適用ができる操作欄。 */
@Component({
  selector: 'app-update-settings',
  imports: [MatButtonModule, TranslocoPipe],
  templateUrl: './update-settings.html',
  styleUrl: './update-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateSettings {
  /** アプリ全体で共有する新版の取得状態と更新操作。 */
  protected readonly updates = inject(AppUpdateService);
  /** 確認中・失敗を優先し、通常時は取得済みの新版を案内する翻訳キー。 */
  protected readonly statusKey = computed(() => {
    const state = this.updates.checkState();
    if (state === 'checking' || state === 'failed') return `settings.${state}`;
    return this.updates.updateAvailable() ? 'settings.available' : `settings.${state}`;
  });
  /** 再読み込みまで更新ボタンの重複押下を防ぐ状態。 */
  protected readonly applying = signal(false);
  /** 更新適用の失敗を表示し、再試行できるようにする状態。 */
  protected readonly applyFailed = signal(false);

  /** 待機中の新版を適用し、失敗した場合はこの画面から再試行できるようにする。 */
  protected async applyUpdate(): Promise<void> {
    if (this.applying()) return;
    this.applying.set(true);
    this.applyFailed.set(false);
    try {
      await this.updates.applyUpdate();
    } catch {
      this.applyFailed.set(true);
    } finally {
      this.applying.set(false);
    }
  }
}
