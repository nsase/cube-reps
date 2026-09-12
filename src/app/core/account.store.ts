import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { LocalAccount } from './account.models';
import { AuthService } from './auth/auth.service';
import { UserDataRepository } from './local-storage/user-data-repository';

/** アカウント情報を保存するストア */
@Injectable({ providedIn: 'root' })
export class AccountStore {
  /** 新規の計測記録の所有者と表示対象アカウントを決める認証状態。 */
  private readonly auth = inject(AuthService);

  /** 同期対象ユーザーデータの永続化を画面とドメイン処理から分離するRepository。 */
  private readonly userDataRepository = inject(UserDataRepository);

  /** UIDで参照する、このブラウザのアカウント表示台帳。 */
  readonly accounts = signal<readonly LocalAccount[]>([]);

  /** アカウント表示情報だけを保存し、認証方式の差を台帳へ閉じ込める。 */
  private readonly rememberAccount = effect(() => {
    const user = this.auth.user();
    if (!user) return;
    const { uid, displayName, email, photoURL, providerIds } = user;
    const account = { uid, displayName, email, photoURL, providerIds };
    untracked(() =>
      this.accounts.update((accounts) => [...accounts.filter((item) => item.uid !== uid), account]),
    );
    void this.userDataRepository.putAccount(account);
  });

  /** アカウント表示情報をロードする。既存の情報と重複しないようにマージする。 */
  load(accounts: LocalAccount[]): void {
    this.accounts.update((current) => [
      ...accounts.filter((account) => !current.some((item) => item.uid === account.uid)),
      ...current,
    ]);
  }
}
