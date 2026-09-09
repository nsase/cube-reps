import { TestBed } from '@angular/core/testing';
import { AccountStore } from './account.store';
import { AuthService } from './auth/auth.service';
import { CubeService } from './cube';
import { UserDataRepository } from './user-data-repository';

/** アカウント表示台帳の復元と認証情報の反映を検証する。 */
describe('AccountStore', () => {
  it('保存済み台帳を復元し、ログインで表示情報を更新してログアウト後も保持する', async () => {
    const repository = TestBed.inject(UserDataRepository);
    await repository.putAccount({ uid: 'account', displayName: 'Old name' });
    await repository.putAccount({ uid: 'other', displayName: 'Other user' });
    await TestBed.inject(CubeService).ready;
    const store = TestBed.inject(AccountStore);
    expect(store.accounts()).toHaveLength(2);
    const user = {
      uid: 'account',
      displayName: 'New name',
      email: 'user@example.test',
      photoURL: null,
      providerIds: ['google.com'],
    };
    TestBed.inject(AuthService).user.set(user);
    TestBed.tick();
    expect(store.accounts()).toEqual([{ uid: 'other', displayName: 'Other user' }, user]);
    expect((await repository.load()).accounts).toEqual(store.accounts());
    TestBed.inject(AuthService).user.set(null);
    TestBed.tick();
    expect(store.accounts()).toHaveLength(2);
  });
});
