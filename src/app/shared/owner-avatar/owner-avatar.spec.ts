import { TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { AccountStore } from '../../core/account.store';
import { CubeService } from '../../core/cube';
import { OwnerAvatar } from './owner-avatar';

describe('OwnerAvatar', () => {
  it('画像、画像エラー時のイニシャル、アカウント、未紐づけを表示し、所有者情報をツールチップで伝える', async () => {
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const solve = cube.addSolve(1000, 'R', 'full');
    TestBed.inject(AccountStore).accounts.set([
      {
        uid: 'apple',
        displayName: 'Apple User',
        providerIds: ['apple.com'],
        photoURL: 'https://example.com/avatar.png',
      },
    ]);
    const fixture = TestBed.createComponent(OwnerAvatar);
    fixture.componentRef.setInput('metadata', { ...solve, ownerType: 'account', ownerId: 'apple' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.initials').textContent).toBe('AU');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
    expect(tooltip.message).toContain('apple.com');
    expect(
      fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label'),
    ).toContain('Apple User');
    fixture.componentRef.setInput('metadata', {
      ...solve,
      ownerType: 'account',
      ownerId: 'unknown',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-icon').textContent).toBe('account_circle');
    fixture.componentRef.setInput('metadata', solve);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-icon').textContent).toBe('devices');
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      'Not linked to an account',
    );
    expect(tooltip.message).toBe('Not linked to an account');
    TestBed.inject(TranslocoService).setActiveLang('ja');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      'アカウント未紐づけ',
    );
    expect(tooltip.message).toBe('アカウント未紐づけ');
  });
});
