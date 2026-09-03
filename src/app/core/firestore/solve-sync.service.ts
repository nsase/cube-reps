import { effect, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CubeService, SolveMutation } from '../cube';
import { FirestoreSolveRepository } from './firestore-solve.repository';

/** ユーザーへ表示するSolve同期状態。 */
export type SolveSyncPhase = 'signed-out' | 'syncing' | 'synced' | 'offline' | 'pending' | 'error';

/** Firestoreへの書き込みと必要なタイミングでのSolve取得を調停するサービス。 */
@Injectable({ providedIn: 'root' })
export class SolveSyncService implements OnDestroy {
  /** 現在の認証アカウント。 */
  private readonly auth = inject(AuthService);
  /** ローカル状態への変更適用境界。 */
  private readonly cube = inject(CubeService);
  /** FirestoreのSolve購読・書き込み境界。 */
  private readonly cloud = inject(FirestoreSolveRepository);
  /** 現在の取得を識別し、古いアカウントの結果を破棄する連番。 */
  private requestId = 0;
  /** 同期失敗後に再試行する直近のローカル操作。 */
  private readonly failedMutations: SolveMutation[] = [];

  /** ヘッダーへ公開する現在の同期状態。 */
  readonly phase = signal<SolveSyncPhase>('signed-out');

  /** 認証アカウント変更時に、そのアカウントの最新Solveを一度取得する。 */
  private readonly watchAccount = effect(() => {
    const user = this.auth.user();
    const requestId = ++this.requestId;
    this.failedMutations.length = 0;
    if (!user) {
      this.phase.set('signed-out');
      return;
    }
    void this.pull(user.uid, requestId);
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

  /** サービス破棄時にブラウザイベント購読を解除する。 */
  ngOnDestroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

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

  /** 現在のアカウントが所有する最新Solveを一度取得する。 */
  refresh(): void {
    const user = this.auth.user();
    if (!user) return;
    void this.pull(user.uid, ++this.requestId);
  }

  /** オンライン復帰時にエラー状態なら再試行し、それ以外は同期中として表示する。 */
  private readonly handleOnline = (): void => {
    if (!this.auth.user()) return;
    this.refresh();
  };

  /** 通信切断中もFirestoreキャッシュへ操作を保存できることを表示する。 */
  private readonly handleOffline = (): void => {
    if (this.auth.user()) this.phase.set('offline');
  };

  /**
   * Firestoreから現在のアカウントのSolveを一度取得し、端末データへ冪等に統合する。
   *
   * @param userId 取得対象のFirebase UID
   * @param requestId 取得開始時のアカウント状態を識別する連番
   */
  private async pull(userId: string, requestId: number): Promise<void> {
    this.phase.set(navigator.onLine ? 'syncing' : 'offline');
    try {
      await this.cube.ready;
      const solves = await this.cloud.list(userId);
      if (requestId !== this.requestId || this.auth.user()?.uid !== userId) return;
      await this.cube.mergeAccountSolves(userId, solves);
      if (requestId === this.requestId) this.phase.set(navigator.onLine ? 'synced' : 'offline');
    } catch {
      if (requestId === this.requestId) this.phase.set('error');
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
