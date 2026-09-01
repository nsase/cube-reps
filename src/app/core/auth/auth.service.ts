import { Injectable, OnDestroy, signal } from '@angular/core';
import { AuthenticatedUser, AuthGateway } from './auth.gateway';

/** アプリ全体へFirebase Authenticationの状態と操作を提供するサービス。 */
@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  /** 現在ログインしているGoogleアカウント。未ログイン時はnull。 */
  readonly user = signal<AuthenticatedUser | null>(null);
  /** ページ起動時の認証状態を復元しているかどうか。 */
  readonly initializing = signal(true);
  /** ログインまたはログアウト操作を処理しているかどうか。 */
  readonly pending = signal(false);
  /** 直前の認証処理が失敗し、ユーザーへの通知が必要かどうか。 */
  readonly failed = signal(false);

  /** Firebaseの認証状態購読を解除する処理。 */
  private readonly unsubscribe: () => void;

  /**
   * Firebaseが永続化したセッションを購読し、ページ再読み込み後も状態を復元する。
   *
   * @param gateway Firebase SDKへのアクセス境界
   */
  constructor(private readonly gateway: AuthGateway) {
    this.unsubscribe = this.gateway.observe(
      (user) => {
        this.user.set(user);
        this.initializing.set(false);
      },
      () => {
        this.failed.set(true);
        this.initializing.set(false);
      },
    );
  }

  /** Googleアカウント選択画面を開き、認証結果を状態へ反映する。 */
  async signIn(): Promise<void> {
    await this.run(() => this.gateway.signIn());
  }

  /** Firebaseセッションを終了し、端末内のユーザーデータは維持する。 */
  async signOut(): Promise<void> {
    await this.run(() => this.gateway.signOut());
  }

  /** サービス破棄時にFirebaseの認証状態購読を解除する。 */
  ngOnDestroy(): void {
    this.unsubscribe();
  }

  /**
   * 認証操作中の表示と共通エラー状態を一貫して更新する。
   *
   * @param operation 実行するFirebase認証操作
   */
  private async run(operation: () => Promise<void>): Promise<void> {
    this.failed.set(false);
    this.pending.set(true);
    try {
      await operation();
    } catch {
      this.failed.set(true);
    } finally {
      this.pending.set(false);
    }
  }
}
