/** ブラウザで利用したアカウントの表示情報。認証情報は保持しない。 */
export interface LocalAccount {
  /** 表示名が同じアカウントも区別するFirebase UID。 */
  uid: string;
  /** 任意の表示名。 */
  displayName?: string | null;
  /** 任意のメールアドレス。 */
  email?: string | null;
  /** 任意のプロフィール画像URL。 */
  photoURL?: string | null;
  /** 利用した認証プロバイダーの識別子。 */
  providerIds?: string[];
}
