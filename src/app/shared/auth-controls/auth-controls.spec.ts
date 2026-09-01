import { TestBed } from '@angular/core/testing';
import { AuthenticatedUser, AuthGateway } from '../../core/auth/auth.gateway';
import { AuthControls } from './auth-controls';

/** 認証UIへ任意の状態と操作結果を返すテスト用Gateway。 */
class AuthControlsGateway extends AuthGateway {
  /** 認証状態の通知先。 */
  private next?: (user: AuthenticatedUser | null) => void;
  /** ログイン操作が呼ばれた回数。 */
  signInCount = 0;
  /** ログアウト操作が呼ばれた回数。 */
  signOutCount = 0;
  /** 次回のログイン操作を失敗させるかどうか。 */
  rejectSignIn = false;

  /** @inheritdoc */
  override observe(next: (user: AuthenticatedUser | null) => void): () => void {
    this.next = next;
    return () => undefined;
  }

  /** @inheritdoc */
  override async signIn(): Promise<void> {
    this.signInCount++;
    if (this.rejectSignIn) throw new Error('sign-in failed');
  }

  /** @inheritdoc */
  override async signOut(): Promise<void> {
    this.signOutCount++;
  }

  /** @param user UIへ表示する認証ユーザー */
  emit(user: AuthenticatedUser | null): void {
    this.next?.(user);
  }
}

describe('AuthControls', () => {
  let gateway: AuthControlsGateway;

  beforeEach(async () => {
    gateway = new AuthControlsGateway();
    await TestBed.configureTestingModule({
      imports: [AuthControls],
      providers: [{ provide: AuthGateway, useValue: gateway }],
    }).compileComponents();
  });

  it('認証状態の確認中と未ログイン時のGoogleログイン操作を表示する', async () => {
    const fixture = TestBed.createComponent(AuthControls);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Checking sign-in',
    );

    gateway.emit(null);
    fixture.detectChanges();
    const signIn = fixture.nativeElement.querySelector(
      '[data-testid="google-sign-in"]',
    ) as HTMLButtonElement;
    expect(signIn.textContent).toContain('Sign in with Google');

    signIn.click();
    await fixture.whenStable();
    expect(gateway.signInCount).toBe(1);
  });

  it('ログイン中のGoogleアカウントを表示してログアウトできる', async () => {
    const fixture = TestBed.createComponent(AuthControls);
    gateway.emit({
      uid: 'firebase-user',
      displayName: 'Cube User',
      email: 'cube@example.com',
      photoURL: null,
    });
    fixture.detectChanges();

    const account = fixture.nativeElement.querySelector(
      '[data-testid="authenticated-account"]',
    ) as HTMLElement;
    expect(account.textContent).toContain('Cube User');
    expect(account.textContent).toContain('cube@example.com');

    const signOut = fixture.nativeElement.querySelector(
      'button[aria-label="Sign out"]',
    ) as HTMLButtonElement;
    signOut.click();
    await fixture.whenStable();
    expect(gateway.signOutCount).toBe(1);
  });

  it('Googleログインに失敗したことをユーザーへ表示する', async () => {
    gateway.rejectSignIn = true;
    const fixture = TestBed.createComponent(AuthControls);
    gateway.emit(null);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('[data-testid="google-sign-in"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Authentication failed',
    );
  });
});
