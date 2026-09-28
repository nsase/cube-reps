import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Nav } from './nav';

describe('Nav', () => {
  it('各種別へ直接移動し、選択中のページと親メニューを示す', async () => {
    TestBed.configureTestingModule({
      imports: [Nav],
      providers: [
        provideRouter(
          ['f2l', 'oll', 'pll'].map((kind) => ({ path: `algorithms/${kind}`, children: [] })),
        ),
      ],
    });
    const fixture = TestBed.createComponent(Nav);
    await fixture.whenStable();
    const parent = fixture.nativeElement.querySelector(
      '[data-testid="algorithms-link"]',
    ) as HTMLAnchorElement;
    expect(parent.getAttribute('aria-label')).toBe('Algorithms');
    for (const kind of ['f2l', 'oll', 'pll']) {
      const link = fixture.nativeElement.querySelector(
        `.algorithm-submenu a[href="/algorithms/${kind}"]`,
      ) as HTMLAnchorElement;
      link.click();
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(`/algorithms/${kind}`);
      expect(link.getAttribute('aria-current')).toBe('page');
      expect(
        fixture.nativeElement.querySelectorAll('.algorithm-submenu [aria-current="page"]'),
      ).toHaveLength(1);
      expect(parent.classList.contains('on')).toBe(true);
    }
    TestBed.inject(TranslocoService).setActiveLang('ja');
    await fixture.whenStable();
    expect(parent.getAttribute('aria-label')).toBe('アルゴリズム');
  });

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
