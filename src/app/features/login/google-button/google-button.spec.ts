import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { GoogleButton } from './google-button';

describe('GoogleButton', () => {
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
