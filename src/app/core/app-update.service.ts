import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/** 新版へ切り替えた後に現在のページを再読み込みする処理。 */
export const RELOAD_PAGE = new InjectionToken<() => void>('RELOAD_PAGE', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return () => document.location.reload();
  },
});

/** Service Workerが取得した新版をユーザー操作で安全に適用するサービス。 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  /** ユーザーへ更新操作を案内できる状態。 */
  readonly updateAvailable = signal(false);
  /** Angular Service Workerの更新イベントを提供するサービス。 */
  private readonly swUpdate = inject(SwUpdate);
  /** 適用済みの新版を表示するためにページを再読み込みする処理。 */
  private readonly reloadPage = inject(RELOAD_PAGE);

  /** Service Workerが有効な環境だけで新版の取得完了を監視する。 */
  constructor() {
    if (!this.swUpdate.isEnabled) return;
    this.swUpdate.versionUpdates
      .pipe(
        filter(
          (event: VersionEvent): event is Extract<VersionEvent, { type: 'VERSION_READY' }> =>
            event.type === 'VERSION_READY',
        ),
      )
      .subscribe(() => this.updateAvailable.set(true));
  }

  /** 待機中の新版を有効化し、同じURLを新版で読み直す。 */
  async applyUpdate(): Promise<void> {
    await this.swUpdate.activateUpdate();
    this.reloadPage();
  }
}
