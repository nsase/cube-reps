import { effect, inject, signal, untracked, WritableSignal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { SyncMetadata } from '../cube.models';
import { SystemStore } from '../system.store';

/** ユーザーへ表示するユーザーデータ同期状態。 */
export type SyncPhase = 'signed-out' | 'syncing' | 'synced' | 'offline' | 'pending' | 'error';

/** 同期対象ごとの差分を共通コントローラーへ渡す境界。 */
export interface SyncAdapter<T extends SyncMetadata, M> {
  /** 永続化されたローカル変更。 */
  mutations: WritableSignal<readonly M[]>;
  /** 操作から同期レコードを取得する。 */
  record(mutation: M): T;
  /** リモートの取得・保存境界。 */
  cloud: {
    /** 削除通知を含む一覧を取得する。 */
    list(userId: string): Promise<T[]>;
    /** 通常更新を保存する。 */
    put(userId: string, record: T): Promise<void>;
    /** 削除通知を保存する。 */
    tombstone(userId: string, record: T): Promise<void>;
  };
  /** 取得した一覧をローカルへ統合する。 */
  merge(records: readonly T[]): Promise<void>;
  /** 転送した版の永続再送フラグを解除する。 */
  acknowledge(record: T): Promise<void>;
}

/** Firestoreへの書き込みと必要なタイミングでのユーザーデータ取得を調停するサービス。 */
export class SyncController<T extends SyncMetadata, M> {
  /** データ種別ごとの保存境界を受け取り、再送と認証監視を共通化する。 */
  constructor(private readonly adapter: SyncAdapter<T, M>) {}

  /** 現在の認証アカウント。 */
  private readonly auth = inject(AuthService);
  /** ブラウザのネットワーク接続状態。 */
  private readonly system = inject(SystemStore);
  /** アプリ全体のストア */
  private readonly cube = inject(CubeService);

  /** 現在の取得を識別し、古いアカウントの結果を破棄する連番。 */
  private requestId = 0;
  /**
   * 接続状態監視の初回実行を識別する。
   * 初回取得はwatchAccountとwatchNetworkが両方とも動くため、watchNetworkでは初回は処理せず重複取得を避ける。
   */
  private networkInitialized = false;
  /** 同期失敗後に再試行する直近のローカル操作。 */
  private readonly failedMutations: M[] = [];

  /** アカウント別の実行中書き込み数。1件の成功で他の失敗を隠さないために使う。 */
  private readonly uploadsInFlight = new Map<string, number>();

  /** ヘッダーへ公開する現在の同期状態。 */
  readonly phase = signal<SyncPhase>('signed-out');

  /** 認証アカウント変更時に、利用可能な保存元からユーザーデータを取得する。 */
  private readonly watchAccount = effect(() => {
    const user = this.auth.user();
    const requestId = ++this.requestId;
    const previousFailures = this.failedMutations.splice(0);
    if (previousFailures.length)
      untracked(() => this.adapter.mutations.update((items) => [...items, ...previousFailures]));
    if (!user) {
      this.phase.set('signed-out');
      return;
    }
    untracked(() => void this.pull(user.uid, requestId));
  });

  /** オフライン移行を表示へ反映し、オンライン復帰時に最新ユーザーデータを取得する。 */
  private readonly watchNetwork = effect(() => {
    const online = this.system.online();
    if (!this.networkInitialized) {
      this.networkInitialized = true;
      return;
    }

    const user = untracked(() => this.auth.user());
    const requestId = ++this.requestId;
    if (!user) return;
    if (!online) {
      this.phase.set('offline');
      return;
    }
    untracked(() => void this.pull(user.uid, requestId));
  });

  /** CubeServiceのローカル操作を、認証が維持されている間だけFirestoreへ転送する。 */
  private readonly uploadMutation = effect(() => {
    const mutations = this.adapter.mutations();
    if (mutations.length === 0) return;
    const user = this.auth.user();
    if (!user) return;
    const applicable = mutations.filter(
      (mutation) =>
        this.adapter.record(mutation).ownerType === 'account' &&
        this.adapter.record(mutation).ownerId === user.uid,
    );
    if (applicable.length === 0) return;
    this.adapter.mutations.set(
      mutations.filter((mutation) => this.adapter.record(mutation).ownerId !== user.uid),
    );
    for (const mutation of applicable) void this.upload(user.uid, mutation);
  });

  /** 失敗した直近の変更またはクラウドからの取得を再試行する。 */
  retry(): void {
    const user = this.auth.user();
    if (!user) return;
    if (this.failedMutations.length > 0) {
      const mutations = this.failedMutations.splice(0);
      for (const mutation of mutations) void this.upload(user.uid, mutation);
      return;
    }
    this.refresh();
  }

  /** 現在のアカウントが所有する最新ユーザーデータを一度取得する。 */
  refresh(): void {
    const user = this.auth.user();
    if (!user) return;
    void this.pull(user.uid, ++this.requestId);
  }

  /**
   * Firestoreから現在のアカウントのユーザーデータを一度取得し、端末データへ冪等に統合する。
   *
   * @param userId 取得対象のFirebase UID
   * @param requestId 取得開始時のアカウント状態を識別する連番
   */
  private async pull(userId: string, requestId: number): Promise<void> {
    this.phase.set(this.system.online() ? 'syncing' : 'offline');
    try {
      await this.cube.ready;
      if (requestId !== this.requestId || this.auth.user()?.uid !== userId) return;
      const remotes = await this.adapter.cloud.list(userId);
      if (requestId !== this.requestId || this.auth.user()?.uid !== userId) return;
      await this.adapter.merge(remotes.filter((remote) => remote.ownerId === userId));
      if (requestId === this.requestId) this.setSettledPhase(userId);
    } catch {
      if (requestId === this.requestId) this.phase.set('error');
    }
  }

  /** ローカル操作をFirestoreキャッシュへ書き込み、SDKの再送キューへ委ねる。 */
  private async upload(userId: string, mutation: M): Promise<void> {
    if (
      this.auth.user()?.uid !== userId ||
      this.adapter.record(mutation).ownerType !== 'account' ||
      this.adapter.record(mutation).ownerId !== userId
    )
      return;
    this.uploadsInFlight.set(userId, (this.uploadsInFlight.get(userId) ?? 0) + 1);
    this.phase.set(this.system.online() ? 'syncing' : 'pending');
    try {
      if (this.adapter.record(mutation).deletedAt)
        await this.adapter.cloud.tombstone(userId, this.adapter.record(mutation));
      else await this.adapter.cloud.put(userId, this.adapter.record(mutation));
      await this.adapter.acknowledge(this.adapter.record(mutation));
    } catch {
      if (this.auth.user()?.uid !== userId) {
        this.adapter.mutations.update((items) => [...items, mutation]);
      } else {
        this.failedMutations.push(mutation);
      }
    } finally {
      this.uploadsInFlight.set(userId, Math.max((this.uploadsInFlight.get(userId) ?? 1) - 1, 0));
      if (this.auth.user()?.uid === userId) this.setSettledPhase(userId);
    }
  }
  /** 取得完了と個別アップロード完了から、残っている処理・失敗を含む状態を表示する。 */
  private setSettledPhase(userId: string): void {
    if (this.failedMutations.length) this.phase.set('error');
    else if (this.uploadsInFlight.get(userId))
      this.phase.set(this.system.online() ? 'syncing' : 'pending');
    else this.phase.set(this.system.online() ? 'synced' : 'offline');
  }
}
