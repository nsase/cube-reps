import { Injectable } from '@angular/core';
import type { Auth } from 'firebase/auth';
import { firebaseConfig } from './firebase.config';

/** UIと認証状態が参照するGoogleアカウント情報。 */
export interface AuthenticatedUser {
  /** Firebase内でアカウントを一意に識別するUID。 */
  uid: string;
  /** Googleアカウントの表示名。 */
  displayName: string | null;
  /** Googleアカウントのメールアドレス。 */
  email: string | null;
  /** Googleアカウントのプロフィール画像URL。 */
  photoURL: string | null;
}

/**
 * Firebase Authenticationのエラーがユーザーによるポップアップ終了か判定する。
 *
 * @param error Firebase SDKから返された認証エラー
 * @returns ユーザーがログインを取りやめた場合はtrue
 */
export function isPopupSignInCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'auth/popup-closed-by-user'
  );
}

/** Firebase SDKへの依存をアプリの認証状態から分離する境界。 */
export abstract class AuthGateway {
  /**
   * 認証状態の変更を購読する。
   *
   * @param next 最新のログインユーザーを受け取る処理
   * @param error 認証状態を復元できなかった場合の処理
   * @returns 購読を解除する処理
   */
  abstract observe(next: (user: AuthenticatedUser | null) => void, error: () => void): () => void;

  /** Googleアカウント選択画面を開いてログインする。 */
  abstract signIn(): Promise<void>;

  /** 現在のFirebaseセッションからログアウトする。 */
  abstract signOut(): Promise<void>;
}

/** Firebase Authenticationを使用する本番用認証Gateway。 */
@Injectable({ providedIn: 'root' })
export class FirebaseAuthGateway extends AuthGateway {
  /** 初期化済みFirebaseアプリに紐づくAuthenticationクライアント。 */
  private readonly auth = this.initializeAuth();

  /** @inheritdoc */
  override observe(next: (user: AuthenticatedUser | null) => void, error: () => void): () => void {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    void Promise.all([this.auth, import('firebase/auth')])
      .then(([auth, { onAuthStateChanged }]) => {
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(
          auth,
          (user) =>
            next(
              user
                ? {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                  }
                : null,
            ),
          error,
        );
      })
      .catch(error);
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }

  /** @inheritdoc */
  override async signIn(): Promise<void> {
    const [auth, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([
      this.auth,
      import('firebase/auth'),
    ]);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (isPopupSignInCancelled(error)) return;
      throw error;
    }
  }

  /** @inheritdoc */
  override async signOut(): Promise<void> {
    const [auth, { signOut }] = await Promise.all([this.auth, import('firebase/auth')]);
    await signOut(auth);
  }

  /**
   * Firebase SDKを遅延ロードしてAuthenticationクライアントを初期化する。
   *
   * 認証を利用しないユーザーの初期バンドルへFirebaseを含めないために遅延ロードする。
   *
   * @returns Firebase Authenticationクライアント
   */
  private async initializeAuth(): Promise<Auth> {
    const [{ getApp, getApps, initializeApp }, { getAuth }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
    ]);
    return getAuth(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));
  }
}
