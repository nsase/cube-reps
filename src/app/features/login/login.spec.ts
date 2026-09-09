import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('Google認証を開始し、処理中は重複操作を防いで失敗を表示する', async () => {
    const fixture = TestBed.createComponent(Login);
    const auth = TestBed.inject(AuthService);
    const signInWithGoogle = vi.spyOn(auth, 'signInWithGoogle').mockImplementation(async () => {
      auth.pending.set(true);
    });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(signInWithGoogle).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Signing in',
    );
    auth.pending.set(false);
    auth.failed.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Authentication failed',
    );
  });

  it('日英を切り替え、ログイン完了後はタイマーへ進める', async () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sign in with Google');
    expect(fixture.nativeElement.textContent).toContain('saved to the cloud');
    expect(fixture.nativeElement.querySelector('a').textContent).toContain(
      'Continue without signing in',
    );
    TestBed.inject(TranslocoService).setActiveLang('ja');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Sign in with Google');
    expect(fixture.nativeElement.textContent).toContain(
      '記録はブラウザ内に保存されるため他端末とは同期されません',
    );
    TestBed.inject(AuthService).user.set({
      uid: 'user',
      displayName: null,
      email: null,
      photoURL: null,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('ログインしました');
    expect(fixture.nativeElement.querySelector('a').textContent).toContain('タイマーへ進む');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/timer');
  });
});
