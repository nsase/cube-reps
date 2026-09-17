import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { GOOGLE_SIGN_IN_AVAILABLE } from '../../../core/platform/native-platform';
import { TranslocoService } from '@jsverse/transloco';
import en from '../../../../../public/assets/i18n/en.json';
import ja from '../../../../../public/assets/i18n/ja.json';
import { GoogleButton } from './google-button';

describe('GoogleButton', () => {
  it('認証未設定のアプリでは利用できない操作を隠し、ゲスト利用を日英で案内する', async () => {
    TestBed.overrideProvider(GOOGLE_SIGN_IN_AVAILABLE, { useValue: false });
    const fixture = TestBed.createComponent(GoogleButton);
    await fixture.whenStable();
    expect(Object.keys(en.auth).sort()).toEqual(Object.keys(ja.auth).sort());
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(en.auth.guestBuild);
    TestBed.inject(TranslocoService).setActiveLang('ja');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(ja.auth.guestBuild);
  });

  it('Google認証を開始し、処理中は重複クリックを防ぐ', () => {
    const fixture = TestBed.createComponent(GoogleButton);
    const auth = TestBed.inject(AuthService);
    const signIn = vi.spyOn(auth, 'signInWithGoogle').mockResolvedValue();
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Sign in with Google');
    button.click();
    expect(signIn).toHaveBeenCalledOnce();
    auth.pending.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    button.click();
    expect(signIn).toHaveBeenCalledOnce();
  });
});
