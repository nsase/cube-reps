import { TestBed } from '@angular/core/testing';
import { AuthenticatedUser, AuthGateway } from './auth.gateway';
import { AuthService } from './auth.service';

/** AuthServiceへ認証状態と操作結果を任意に返すテスト用Gateway。 */
class FakeAuthGateway extends AuthGateway {
  /** 購読中の認証状態通知先。 */
  private next?: (user: AuthenticatedUser | null) => void;
  /** 購読中の認証エラー通知先。 */
  private error?: () => void;
  /** ログイン操作のテスト用実装。 */
  signInResult: () => Promise<void> = async () => undefined;
  /** ログアウト操作のテスト用実装。 */
  signOutResult: () => Promise<void> = async () => undefined;
  /** 購読解除が呼ばれた回数。 */
  unsubscribeCount = 0;

  /** @inheritdoc */
  override observe(next: (user: AuthenticatedUser | null) => void, error: () => void): () => void {
    this.next = next;
    this.error = error;
    return () => this.unsubscribeCount++;
  }

  /** @inheritdoc */
  override signIn(): Promise<void> {
    return this.signInResult();
  }

  /** @inheritdoc */
  override signOut(): Promise<void> {
    return this.signOutResult();
  }

  /** @param user Firebaseから通知する認証ユーザー */
  emit(user: AuthenticatedUser | null): void {
    this.next?.(user);
  }

  /** 認証状態の復元失敗を通知する。 */
  failObservation(): void {
    this.error?.();
  }
}

describe('AuthService', () => {
  let gateway: FakeAuthGateway;
  let service: AuthService;

  beforeEach(() => {
    gateway = new FakeAuthGateway();
    TestBed.configureTestingModule({ providers: [{ provide: AuthGateway, useValue: gateway }] });
    service = TestBed.inject(AuthService);
  });

  it('Firebaseから初期認証状態を受け取るまで処理中として表示する', () => {
    expect(service.initializing()).toBe(true);
    expect(service.user()).toBeNull();

    gateway.emit(null);

    expect(service.initializing()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('ページ再読み込み時にFirebaseが復元したユーザーを保持する', () => {
    const user = {
      uid: 'firebase-user',
      displayName: 'Cube User',
      email: 'cube@example.com',
      photoURL: 'https://example.com/photo.png',
    };

    gateway.emit(user);

    expect(service.user()).toEqual(user);
    expect(service.initializing()).toBe(false);
  });

  it('ログイン中の状態を表示し、失敗時は既存ユーザー情報を変更しない', async () => {
    let rejectSignIn: ((reason?: unknown) => void) | undefined;
    gateway.signInResult = () =>
      new Promise<void>((_, reject) => {
        rejectSignIn = reject;
      });

    const result = service.signIn();
    expect(service.pending()).toBe(true);
    rejectSignIn?.(new Error('popup closed'));
    await result;

    expect(service.pending()).toBe(false);
    expect(service.failed()).toBe(true);
    expect(service.user()).toBeNull();
  });

  it('Gatewayが通常キャンセルとして完了した場合は認証失敗を表示しない', async () => {
    await service.signIn();

    expect(service.pending()).toBe(false);
    expect(service.failed()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('ログアウト操作をGatewayへ委譲する', async () => {
    const signOut = vi.fn(async () => undefined);
    gateway.signOutResult = signOut;

    await service.signOut();

    expect(signOut).toHaveBeenCalledOnce();
    expect(service.failed()).toBe(false);
  });

  it('認証状態の購読に失敗したことを表示し、破棄時に購読を解除する', () => {
    gateway.failObservation();
    expect(service.initializing()).toBe(false);
    expect(service.failed()).toBe(true);

    service.ngOnDestroy();
    expect(gateway.unsubscribeCount).toBe(1);
  });
});
