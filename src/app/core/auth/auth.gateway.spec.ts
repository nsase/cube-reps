import { isPopupSignInCancelled } from './auth.gateway';

describe('isPopupSignInCancelled', () => {
  it('ユーザーがポップアップを閉じたFirebaseエラーをキャンセルと判定する', () => {
    expect(isPopupSignInCancelled({ code: 'auth/popup-closed-by-user' })).toBe(true);
  });

  it.each([
    { code: 'auth/network-request-failed' },
    { code: 'auth/popup-blocked' },
    new Error('unknown error'),
    null,
  ])('キャンセル以外の認証失敗はエラーとして扱う', (error) => {
    expect(isPopupSignInCancelled(error)).toBe(false);
  });
});
