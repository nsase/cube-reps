import { DOCUMENT, DestroyRef, inject, Injectable, InjectionToken, isDevMode } from '@angular/core';
import { ReplaySubject } from 'rxjs';

/** 更新画面に伝えるSWの取得結果。旧画面の状態遷移を維持する。 */
export interface VersionEvent {
  type:
    | 'VERSION_DETECTED'
    | 'VERSION_READY'
    | 'NO_NEW_VERSION_DETECTED'
    | 'VERSION_INSTALLATION_FAILED';
  version?: { hash: string; appData?: unknown };
  currentVersion?: { hash: string; appData?: unknown };
  latestVersion?: { hash: string; appData?: unknown };
  error?: string;
}

/** 本番だけでSWを起動し、テストではブラウザAPIを独立して差し替える。 */
export const WORKER_ENABLED = new InjectionToken<boolean>('WORKER_ENABLED', {
  providedIn: 'root',
  factory: () => !isDevMode(),
});

/** Workboxの登録と更新を管理する。オフラインでは登録・更新のネットワーク要求を開始しない。 */
@Injectable({ providedIn: 'root' })
export class WorkerUpdates {
  /** 配信先のbase URLとブラウザAPIを参照する。 */
  private readonly document = inject(DOCUMENT);
  /** ブラウザのSWコンテナー。 */
  private readonly container = this.document.defaultView?.navigator.serviceWorker;
  /** 本番かつSW対応ブラウザで登録できるか。 */
  readonly isEnabled = inject(WORKER_ENABLED) && !!this.container;
  /** 購読前に見つかった待機中の更新も画面へ伝える。 */
  readonly versionUpdates = new ReplaySubject<VersionEvent>(1);
  /** 同じスコープにある既存の登録を再利用する。 */
  private registration?: ServiceWorkerRegistration;
  /** 同時に複数の登録・更新要求を発行しない。 */
  private pending?: Promise<boolean>;
  /** 起動処理とオンライン復帰のリスナーを一度だけ登録する。 */
  private started = false;
  /** 同じ待機中SWの通知を何度も表示しない。 */
  private announced?: ServiceWorker;
  /** 登録監視を終了する処理。 */
  private stopWatching?: () => void;
  /** サービス破棄時にブラウザのリスナーを解除する。 */
  private readonly destroyRef = inject(DestroyRef);

  /** ブラウザがオフラインと報告している間は通信を控える。 */
  private get online(): boolean {
    return this.document.defaultView?.navigator.onLine !== false;
  }

  /** 初回起動とオンライン復帰時に登録・更新する。画面表示をネットワーク完了まで待たせない。 */
  start(): void {
    if (!this.isEnabled || this.started) return;
    this.started = true;
    const resume = () => {
      void this.checkForUpdate().catch(() => undefined);
    };
    this.document.defaultView?.addEventListener('online', resume);
    this.destroyRef.onDestroy(() => {
      this.document.defaultView?.removeEventListener('online', resume);
      this.stopWatching?.();
    });
    if (this.online) resume();
    else {
      // getRegistrationは保存済み登録の参照だけで通信しない。
      void this.container!.getRegistration(this.document.baseURI)
        .then((registration) => {
          if (registration && !this.destroyRef.destroyed) this.watch(registration);
        })
        .catch(() => undefined);
    }
  }

  /** 新版のインストール完了まで確認する。オフライン時は通信前に失敗を返す。 */
  checkForUpdate(): Promise<boolean> {
    if (!this.isEnabled) return Promise.resolve(false);
    if (!this.online) return Promise.reject(new Error('Offline'));
    if (this.pending) return this.pending;
    this.pending = this.check().finally(() => {
      this.pending = undefined;
    });
    return this.pending;
  }

  /** ネットワーク要求を伴う登録・更新と、取得結果の通知を順に実行する。 */
  private async check(): Promise<boolean> {
    try {
      const existing =
        this.registration ?? (await this.container!.getRegistration(this.document.baseURI));
      if (!this.online) throw new Error('Offline');
      const registration =
        existing ??
        (await this.container!.register(new URL('ngsw-worker.js', this.document.baseURI).href, {
          scope: new URL('./', this.document.baseURI).href,
          updateViaCache: 'none',
        }));
      this.watch(registration);
      if (existing) {
        if (!this.online) throw new Error('Offline');
        await registration.update();
      }
      if (registration.installing) await this.waitForInstalled(registration.installing);
      if (registration.waiting) {
        this.announce(registration.waiting);
        return true;
      }
      this.versionUpdates.next({ type: 'NO_NEW_VERSION_DETECTED' });
      return false;
    } catch (error) {
      this.versionUpdates.next({ type: 'VERSION_INSTALLATION_FAILED' });
      throw error;
    }
  }

  /** ブラウザ自身が発見した更新も、取得完了後だけ案内する。 */
  private watch(registration: ServiceWorkerRegistration): void {
    if (this.registration === registration) return;
    this.stopWatching?.();
    this.registration = registration;
    const found = () => {
      const worker = registration.installing;
      if (!worker) return;
      void this.waitForInstalled(worker)
        .then(() => {
          if (registration.waiting) this.announce(registration.waiting);
        })
        .catch(() => {
          this.versionUpdates.next({ type: 'VERSION_INSTALLATION_FAILED' });
        });
    };
    registration.addEventListener('updatefound', found);
    this.stopWatching = () => registration.removeEventListener('updatefound', found);
    if (registration.waiting) this.announce(registration.waiting);
  }

  /** 同じ待機中の新版を再通知せず、ユーザーの通知を閉じる操作を尊重する。 */
  private announce(worker: ServiceWorker): void {
    if (this.announced === worker) return;
    this.announced = worker;
    this.versionUpdates.next({ type: 'VERSION_READY' });
  }

  /** SWの取得失敗や停止を有限時間で検出し、確認操作を再試行できるようにする。 */
  private waitForInstalled(worker: ServiceWorker): Promise<void> {
    return this.waitForState(worker, ['installed', 'activating', 'activated']);
  }

  /** 指定したライフサイクル状態まで待機し、終了時に監視を解除する。 */
  private waitForState(worker: ServiceWorker, states: ServiceWorkerState[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timeout);
        worker.removeEventListener('statechange', changed);
        if (error) reject(error);
        else resolve();
      };
      const changed = () => {
        if (states.includes(worker.state)) finish();
        else if (worker.state === 'redundant') finish(new Error('Worker installation failed'));
      };
      const timeout = setTimeout(() => finish(new Error('Worker timed out')), 60_000);
      worker.addEventListener('statechange', changed);
      changed();
    });
  }

  /** ユーザーが選んだ新版を有効化する。完了後の再読み込みは呼び出し側が行う。 */
  async activateUpdate(): Promise<boolean> {
    const registration =
      this.registration ?? (await this.container?.getRegistration(this.document.baseURI));
    const worker = registration?.waiting;
    if (!worker) throw new Error('No waiting worker');
    const activated = this.waitForState(worker, ['activated']);
    worker.postMessage({ type: 'SKIP_WAITING' });
    await activated;
    return true;
  }
}
