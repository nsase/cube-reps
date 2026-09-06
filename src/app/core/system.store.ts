import { Injectable, OnDestroy, signal } from '@angular/core';

/** アプリ全体で参照するブラウザ由来のシステム状態を管理するStore。 */
@Injectable({ providedIn: 'root' })
export class SystemStore implements OnDestroy {
  /** ブラウザが通知した現在のネットワーク接続状態。 */
  private readonly onlineState = signal(navigator.onLine);

  /** アプリ内の各処理が参照するネットワーク接続状態。 */
  readonly online = this.onlineState.asReadonly();

  /** ブラウザのネットワーク状態変更をStoreへ反映する。 */
  constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /** Store破棄時にブラウザイベントの購読を解除する。 */
  ngOnDestroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  /** オンライン復帰を利用側へ通知する。 */
  private readonly handleOnline = (): void => {
    this.onlineState.set(true);
  };

  /** オフライン移行を利用側へ通知する。 */
  private readonly handleOffline = (): void => {
    this.onlineState.set(false);
  };
}
