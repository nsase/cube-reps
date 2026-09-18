import { Location } from '@angular/common';
import { DestroyRef, inject, Injectable, InjectionToken } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { App } from '@capacitor/app';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { AppUpdateService } from '../app-update.service';
import { IS_NATIVE_APP } from './native-platform';

/** 戻る操作と最小化の端末APIを提供する。テストではモジュールの読込順に依存せず差し替える。 */
export const NATIVE_APP_PLUGIN = new InjectionToken<Pick<typeof App, 'addListener' | 'minimizeApp'>>(
  'NATIVE_APP_PLUGIN',
  {
    providedIn: 'root',
    // Proxyを直接DIへ渡すとAngularがngOnDestroyも端末APIとして呼ぶため、必要な操作だけ公開する。
    factory: () => ({ addListener: App.addListener, minimizeApp: () => App.minimizeApp() }),
  },
);

/** 画面消灯制御の端末APIを提供する。テストでは実機APIを呼ばず非同期の完了順を検証する。 */
export const NATIVE_KEEP_AWAKE_PLUGIN = new InjectionToken<
  Pick<typeof KeepAwake, 'keepAwake' | 'allowSleep'>
>('NATIVE_KEEP_AWAKE_PLUGIN', {
  providedIn: 'root',
  factory: () => ({
    keepAwake: () => KeepAwake.keepAwake(),
    allowSleep: () => KeepAwake.allowSleep(),
  }),
});

/** Androidの戻る操作とネイティブ画面消灯防止をWebの画面処理から分離する。 */
@Injectable({ providedIn: 'root' })
export class NativeAppService {
  /** 戻る操作と最小化を実行する端末API。 */
  private readonly app = inject(NATIVE_APP_PLUGIN);
  /** 計測状態に合わせて画面消灯を制御する端末API。 */
  private readonly keepAwake = inject(NATIVE_KEEP_AWAKE_PLUGIN);
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
    const listener = this.app.addListener('backButton', ({ canGoBack }) => {
      if (!this.updates.showNonEssentialNotices()) return;
      const dialog = this.dialogs.openDialogs.at(-1);
      if (dialog) {
        if (!dialog.disableClose) dialog.close();
      } else if (canGoBack) {
        this.location.back();
      } else {
        void this.app.minimizeApp();
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
      .then(() => (enabled ? this.keepAwake.keepAwake() : this.keepAwake.allowSleep()))
      .catch(() => undefined);
  }
}
