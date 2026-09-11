import { DOCUMENT } from '@angular/common';
import { computed, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  /** 同じ起動中にユーザーが更新通知を閉じたか。 */
  private readonly updateDismissed = signal(false);
  /** タイマー計測など、操作を妨げてはならない状態で更新通知を抑止するか。 */
  private readonly notificationSuppressed = signal(false);
  /** タイマー計測など主要操作中でなく、補助通知を表示できるか。 */
  readonly showNonEssentialNotices = computed(() => !this.notificationSuppressed());
  /** 新版が利用可能で、現在の操作を妨げない場合に更新通知を表示する。 */
  readonly showUpdateNotice = computed(
    () => this.updateAvailable() && !this.updateDismissed() && !this.notificationSuppressed(),
  );
  /** Angular Service Workerの更新イベントを提供するサービス。 */
  private readonly swUpdate = inject(SwUpdate);
  /** この環境でService Workerによる更新を利用できるか。 */
  readonly enabled = this.swUpdate.isEnabled;
  /** 手動確認の進行状況。取得済みの新版はupdateAvailableで別途保持する。 */
  readonly checkState = signal<'idle' | 'checking' | 'latest' | 'failed'>('idle');
  /** 通信不能時のfalseを「最新版」と誤表示しないための確認結果。 */
  private latestConfirmed = false;
  /** 適用済みの新版を表示するためにページを再読み込みする処理。 */
  private readonly reloadPage = inject(RELOAD_PAGE);

  /** Service Workerが有効な環境だけで新版の取得完了を監視する。 */
  constructor() {
    if (!this.swUpdate.isEnabled) return;
    this.swUpdate.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event: VersionEvent) => {
      if (event.type === 'NO_NEW_VERSION_DETECTED' && this.checkState() === 'checking') {
        this.latestConfirmed = true;
      }
      if (event.type === 'VERSION_READY') {
        this.updateDismissed.set(false);
        this.updateAvailable.set(true);
      }
    });
  }

  /** 現在待機中のバージョンに対する通知をユーザー操作で閉じる。 */
  dismissUpdate(): void {
    this.updateDismissed.set(true);
  }

  /** 更新通知が現在の主要操作を妨げないよう表示可否を切り替える。
   *
   * @param suppressed 更新通知を一時的に非表示にする場合はtrue
   */
  setNotificationSuppressed(suppressed: boolean): void {
    this.notificationSuppressed.set(suppressed);
  }

  /** 新版の取得を手動で確認し、失敗時にも再試行できる状態へ戻す。 */
  async checkForUpdate(): Promise<void> {
    if (!this.enabled || this.checkState() === 'checking') return;
    this.latestConfirmed = false;
    this.checkState.set('checking');
    try {
      const found = await this.swUpdate.checkForUpdate();
      if (found) this.updateAvailable.set(true);
      this.checkState.set(found || this.latestConfirmed ? 'latest' : 'failed');
    } catch {
      this.checkState.set('failed');
    }
  }

  /** 待機中の新版を有効化し、同じURLを新版で読み直す。 */
  async applyUpdate(): Promise<void> {
    await this.swUpdate.activateUpdate();
    this.reloadPage();
  }
}
