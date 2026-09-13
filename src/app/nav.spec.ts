import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Nav } from './nav';

describe('Nav', () => {
  it('設定へ移動し、選択状態と日本語ラベルを表示する', async () => {
    TestBed.configureTestingModule({
      imports: [Nav],
      providers: [provideRouter([{ path: 'settings', children: [] }])],
    });
    const fixture = TestBed.createComponent(Nav);
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector(
      '[data-testid="settings-link"]',
    ) as HTMLAnchorElement;
    expect(link.textContent).toContain('Settings');
    link.click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/settings');
    expect(link.classList.contains('on')).toBe(true);
    TestBed.inject(TranslocoService).setActiveLang('ja');
    await fixture.whenStable();
    expect(link.getAttribute('aria-label')).toBe('設定');
  });
});
