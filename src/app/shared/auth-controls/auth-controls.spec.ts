import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { AppUpdateService } from '../../core/app-update.service';
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
  override async signInWithGoogle(): Promise<void> {
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
      providers: [provideRouter([]), { provide: AuthGateway, useValue: gateway }],
    }).compileComponents();
  });

  /** ユーザーの操作と同じようにプロフィールを開く。 */
  async function openProfile() {
    const fixture = TestBed.createComponent(AuthControls);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    return { fixture, popup: TestBed.inject(OverlayContainer).getContainerElement() };
  }

  it('復元中は状態を表示し、ゲストにはログインページへのリンクを表示する', async () => {
    const { fixture, popup } = await openProfile();
    expect(popup.textContent).toContain('Checking sign-in');
    gateway.emit(null);
    fixture.detectChanges();
    expect(popup.textContent).toContain('Guest account');
    expect(popup.querySelector('a')?.getAttribute('href')).toBe('/login');
    expect(gateway.signInCount).toBe(0);
    TestBed.inject(TranslocoService).setActiveLang('ja');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(popup.textContent).toContain('ゲストアカウント');
    expect(popup.textContent).toContain('ログイン');
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe(
      'プロフィール',
    );
  });

  it('情報はポップアップに表示し、ログアウトできる', async () => {
    const { fixture, popup } = await openProfile();
    gateway.emit({
      uid: 'user',
      displayName: 'Cube User',
      email: 'cube@example.com',
      photoURL: null,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('cube@example.com');
    expect(popup.textContent).toContain('Cube User');
    expect(popup.textContent).toContain('cube@example.com');
    (popup.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(gateway.signOutCount).toBe(1);
  });

  it('プロフィール画像の読み込み失敗時は共通アイコンを表示する', async () => {
    const { fixture } = await openProfile();
    gateway.emit({
      uid: 'user',
      displayName: null,
      email: null,
      photoURL: 'https://example.com/avatar.png',
    });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('mat-icon').textContent).toContain('account_circle');
  });

  it('計測が始まるとメニューを閉じ、計測中は再表示できない', async () => {
    const { fixture, popup } = await openProfile();
    TestBed.inject(AppUpdateService).setNotificationSuppressed(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await vi.waitFor(() => expect(popup.querySelector('[role="menu"]')).toBeNull());
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });
});
