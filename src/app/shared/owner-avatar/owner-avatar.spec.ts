import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';
import { CubeService } from '../../core/cube';
import { OwnerAvatar } from './owner-avatar';

describe('OwnerAvatar', () => {
  it('画像、画像エラー時のイニシャル、アカウント、未紐づけを同じ領域に表示して詳細を開く', async () => {
    const dialog = { open: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: MatDialog, useValue: dialog }] });
    const cube = TestBed.inject(CubeService);
    await cube.ready;
    const solve = cube.addSolve(1000, 'R', 'full');
    cube.accounts.set([
      {
        uid: 'apple',
        displayName: 'Apple User',
        providerIds: ['apple.com'],
        photoURL: 'https://example.com/avatar.png',
      },
    ]);
    const fixture = TestBed.createComponent(OwnerAvatar);
    fixture.componentRef.setInput('solve', { ...solve, ownerType: 'account', ownerId: 'apple' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.initials').textContent).toBe('AU');
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(dialog.open.mock.calls[0][1].data.message).toContain('apple.com');
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toContain(
      'Apple User',
    );
    fixture.componentRef.setInput('solve', { ...solve, ownerType: 'account', ownerId: 'unknown' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-icon').textContent).toBe('account_circle');
    fixture.componentRef.setInput('solve', solve);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-icon').textContent).toBe('devices');
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe(
      'Not linked to an account',
    );
    TestBed.inject(TranslocoService).setActiveLang('ja');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe(
      'アカウント未紐づけ',
    );
  });
});
