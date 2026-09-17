import { TestBed } from '@angular/core/testing';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut } from 'firebase/auth';
import { FirebaseAuthGateway } from './auth.gateway';
import { IS_NATIVE_APP } from '../platform/native-platform';

vi.mock('firebase/app', () => ({
  getApps: () => [{}],
  getApp: () => ({}),
  initializeApp: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  getAuth: () => 'shared-auth',
  GoogleAuthProvider: class {
    static credential = vi.fn(() => 'google-credential');
    setCustomParameters = vi.fn();
  },
  signInWithCredential: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('@capacitor-firebase/authentication', () => ({
  FirebaseAuthentication: { signInWithGoogle: vi.fn() },
}));

describe('FirebaseAuthGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: IS_NATIVE_APP, useValue: true }] });
    vi.mocked(FirebaseAuthentication.signInWithGoogle).mockResolvedValue({
      credential: { idToken: 'id-token', providerId: 'google.com' },
      user: null,
      additionalUserInfo: null,
    });
    vi.mocked(signInWithPopup).mockResolvedValue({} as never);
  });

  it('Androidで取得したIDトークンをFirestoreと共通のWeb認証セッションへ渡す', async () => {
    await TestBed.inject(FirebaseAuthGateway).signInWithGoogle();
    expect(FirebaseAuthentication.signInWithGoogle).toHaveBeenCalledWith({ skipNativeAuth: true });
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('id-token');
    expect(signInWithCredential).toHaveBeenCalledWith('shared-auth', 'google-credential');
    expect(signInWithPopup).not.toHaveBeenCalled();
  });

  it('トークンが取得できなければセッションを作らず失敗を通知する', async () => {
    vi.mocked(FirebaseAuthentication.signInWithGoogle).mockResolvedValue({
      user: null,
      additionalUserInfo: null,
      credential: null,
    });
    await expect(TestBed.inject(FirebaseAuthGateway).signInWithGoogle()).rejects.toThrow(
      'ID token',
    );
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('端末の認証失敗を画面へ返し、Webのポップアップへフォールバックしない', async () => {
    vi.mocked(FirebaseAuthentication.signInWithGoogle).mockRejectedValueOnce(new Error('network'));
    await expect(TestBed.inject(FirebaseAuthGateway).signInWithGoogle()).rejects.toThrow('network');
    expect(signInWithPopup).not.toHaveBeenCalled();
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('ログアウトは共通セッションを終了する', async () => {
    await TestBed.inject(FirebaseAuthGateway).signOut();
    expect(signOut).toHaveBeenCalledWith('shared-auth');
  });

  it('Webでは従来のポップアップ認証を使い、ユーザーによるキャンセルを許容する', async () => {
    TestBed.overrideProvider(IS_NATIVE_APP, { useValue: false });
    const gateway = TestBed.inject(FirebaseAuthGateway);
    await gateway.signInWithGoogle();
    expect(signInWithPopup).toHaveBeenCalledOnce();
    expect(FirebaseAuthentication.signInWithGoogle).not.toHaveBeenCalled();
    vi.mocked(signInWithPopup).mockRejectedValueOnce({ code: 'auth/popup-closed-by-user' });
    await expect(gateway.signInWithGoogle()).resolves.toBeUndefined();
  });
});
