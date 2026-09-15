import { Location } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { App } from '@capacitor/app';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { AppUpdateService } from '../app-update.service';
import { IS_NATIVE_APP } from './native-platform';

/** Androidの戻る操作とネイティブ画面消灯防止をWebの画面処理から分離する。 */
@Injectable({ providedIn: 'root' })
export class NativeAppService {
  /** ネイティブ端末APIを使用できる起動環境か。 */
  readonly isNative = inject(IS_NATIVE_APP);
  /** 計測中など、画面外への操作を抑止すべき状態。 */
  private readonly updates = inject(AppUpdateService);
  /** 確認ダイアログを取り消してから画面を戻すためのダイアログ管理。 */
  private readonly dialogs = inject(MatDialog);
  /** Angularが管理する画面履歴。 */
  private readonly location = inject(Location);
  /** 開始直後の停止でも、遅れた消灯防止要求が残らないよう順番に処理する。 */
  private awakeQueue: Promise<void> = Promise.resolve();

  /** アプリの生存期間だけ戻る操作を購読し、計測中の意図しない画面離脱を防ぐ。 */
  constructor() {
    if (!this.isNative) return;
    const destroyRef = inject(DestroyRef);
    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (!this.updates.showNonEssentialNotices()) return;
      const dialog = this.dialogs.openDialogs.at(-1);
      if (dialog) {
        if (!dialog.disableClose) dialog.close();
      } else if (canGoBack) {
        this.location.back();
      } else {
        void App.minimizeApp();
      }
    });
    destroyRef.onDestroy(() => {
      void listener.then((handle) => handle.remove());
      this.setKeepAwake(false);
    });
  }

  /**
   * ネイティブアプリでは計測中だけ画面の消灯を防ぐ。
   * 許可拒否や端末側の失敗で計測を中断しない。
   * @param enabled 計測中の場合はtrue
   */
  setKeepAwake(enabled: boolean): void {
    if (!this.isNative) return;
    this.awakeQueue = this.awakeQueue
      .then(() => (enabled ? KeepAwake.keepAwake() : KeepAwake.allowSleep()))
      .catch(() => undefined);
  }
}
