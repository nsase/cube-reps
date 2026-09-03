import { effect, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CubeService, SolveMutation } from '../cube';
import { FirestoreSolveRepository } from './firestore-solve.repository';

/** ユーザーへ表示するSolve同期状態。 */
export type SolveSyncPhase = 'signed-out' | 'syncing' | 'synced' | 'offline' | 'pending' | 'error';

/** Firestoreと端末間の継続同期を調停するサービス。 */
@Injectable({ providedIn: 'root' })
export class SolveSyncService implements OnDestroy {
  /** 現在の認証アカウント。 */
  private readonly auth = inject(AuthService);
  /** ローカル状態への変更適用境界。 */
  private readonly cube = inject(CubeService);
  /** FirestoreのSolve購読・書き込み境界。 */
  private readonly cloud = inject(FirestoreSolveRepository);
  /** 現在の購読を識別し、古いアカウントの通知を破棄する連番。 */
  private subscriptionId = 0;
  /** Firestore購読の解除処理。 */
  private unsubscribe?: () => void;
  /** 同期失敗後に再試行する直近のローカル操作。 */
  private readonly failedMutations: SolveMutation[] = [];

  /** ヘッダーへ公開する現在の同期状態。 */
  readonly phase = signal<SolveSyncPhase>('signed-out');

  /** 認証アカウント変更時に、そのアカウント専用の購読へ切り替える。 */
  private readonly watchAccount = effect(() => {
    const user = this.auth.user();
    const subscriptionId = ++this.subscriptionId;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.failedMutations.length = 0;
    untracked(() => this.cube.showAccount(user?.uid ?? null));
    if (!user) {
      this.phase.set('signed-out');
      return;
    }
    this.phase.set(navigator.onLine ? 'syncing' : 'offline');
    void this.subscribe(user.uid, subscriptionId);
  });

  /** CubeServiceのローカル操作を、認証が維持されている間だけFirestoreへ転送する。 */
  private readonly uploadMutation = effect(() => {
    const mutations = this.cube.solveMutations();
    if (mutations.length === 0) return;
    const user = this.auth.user();
    if (!user) return;
    const applicable = mutations.filter((mutation) => mutation.solve.ownerId === user.uid);
    if (applicable.length === 0) return;
    this.cube.solveMutations.set(
      mutations.filter((mutation) => mutation.solve.ownerId !== user.uid),
    );
    for (const mutation of applicable) void this.upload(user.uid, mutation);
  });

  /** ブラウザのネットワーク状態を同期表示へ反映する。 */
  constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /** サービス破棄時にFirestore購読とブラウザイベント購読を解除する。 */
  ngOnDestroy(): void {
    this.unsubscribe?.();
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  /** 失敗した直近の変更またはFirestore購読を再試行する。 */
  retry(): void {
    const user = this.auth.user();
    if (!user) return;
    if (this.failedMutations.length > 0) {
      const mutations = this.failedMutations.splice(0);
      for (const mutation of mutations) void this.upload(user.uid, mutation);
      return;
    }
    const subscriptionId = ++this.subscriptionId;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.phase.set(navigator.onLine ? 'syncing' : 'offline');
    void this.subscribe(user.uid, subscriptionId);
  }

  /** オンライン復帰時にエラー状態なら再試行し、それ以外は同期中として表示する。 */
  private readonly handleOnline = (): void => {
    if (!this.auth.user()) return;
    if (this.phase() === 'error') this.retry();
    else this.phase.set('syncing');
  };

  /** 通信切断中もFirestoreキャッシュへ操作を保存できることを表示する。 */
  private readonly handleOffline = (): void => {
    if (this.auth.user()) this.phase.set('offline');
  };

  /** Firestoreスナップショットを購読し、ローカルへ冪等に統合する。 */
  private async subscribe(userId: string, subscriptionId: number): Promise<void> {
    try {
      await this.cube.ready;
      const unsubscribe = await this.cloud.watch(
        userId,
        (solves, pending, fromCache) => {
          if (subscriptionId !== this.subscriptionId || this.auth.user()?.uid !== userId) return;
          void this.cube.mergeAccountSolves(userId, solves);
          this.phase.set(
            !navigator.onLine || (fromCache && !pending)
              ? 'offline'
              : pending
                ? 'pending'
                : 'synced',
          );
        },
        () => {
          if (subscriptionId === this.subscriptionId) this.phase.set('error');
        },
      );
      if (subscriptionId !== this.subscriptionId || this.auth.user()?.uid !== userId) {
        unsubscribe();
      } else {
        this.unsubscribe = unsubscribe;
      }
    } catch {
      if (subscriptionId === this.subscriptionId) this.phase.set('error');
    }
  }

  /** ローカル操作をFirestoreキャッシュへ書き込み、SDKの再送キューへ委ねる。 */
  private async upload(userId: string, mutation: SolveMutation): Promise<void> {
    this.phase.set(navigator.onLine ? 'syncing' : 'pending');
    try {
      if (mutation.kind === 'delete') await this.cloud.tombstone(userId, mutation.solve);
      else await this.cloud.put(userId, mutation.solve);
      if (!navigator.onLine) this.phase.set('pending');
    } catch {
      this.failedMutations.push(mutation);
      this.phase.set('error');
    }
  }
}
