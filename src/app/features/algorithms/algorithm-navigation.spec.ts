import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslocoService } from '@jsverse/transloco';
import { routes } from '../../app.routes';
import { AlgorithmSelection } from './algorithm-selection/algorithm-selection';
import { AlgorithmChoice } from './algorithm-choice/algorithm-choice';
import { AlgorithmKindLinks } from './algorithm-kind-links/algorithm-kind-links';
import { Algorithms } from './algorithms';

describe('Algorithm navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('選択画面からF2Lページへ移動し、言語変更を反映する', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/algorithms', AlgorithmSelection);
    await firstValueFrom(TestBed.inject(TranslocoService).load('en'));
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/algorithms');
    expect(harness.routeNativeElement!.querySelectorAll('app-algorithm-choice')).toHaveLength(3);
    expect(harness.routeNativeElement!.textContent).toContain('Pair and insert');
    const i18n = TestBed.inject(TranslocoService);
    await firstValueFrom(i18n.load('ja'));
    i18n.setActiveLang('ja');
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('最初の2層');
    expect(harness.routeNativeElement!.textContent).toContain('最終層の向き');
    expect(harness.routeNativeElement!.textContent).toContain('最終層の位置');
    (
      harness.routeNativeElement!.querySelector('a[href="/algorithms/f2l"]') as HTMLAnchorElement
    ).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/algorithms/f2l');
    expect(harness.routeNativeElement!.textContent).toContain('F2Lの41ケース');
    i18n.setActiveLang('en');
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.textContent).toContain('Browse 41 F2L cases');
  });

  it('F2LのURLを直接開き、他の種類への切り替えを表示する', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/algorithms/f2l', Algorithms);
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('F2L');
    expect(
      harness.routeNativeElement!.querySelectorAll('app-algorithm-kind-links button'),
    ).toHaveLength(3);
    expect(
      harness.routeNativeElement!.querySelector('[aria-current="page"]')!.textContent,
    ).toContain('F2L');
  });

  it('選択項目に種類に対応する説明とリンクを表示する', async () => {
    const fixture = TestBed.createComponent(AlgorithmChoice);
    fixture.componentRef.setInput('kind', 'oll');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/algorithms/oll');
    expect(fixture.nativeElement.textContent).toContain('57');
  });

  it('共通の切り替えボタンでOLLとPLLへ移動する', async () => {
    const fixture = TestBed.createComponent(AlgorithmKindLinks);
    await fixture.whenStable();
    for (const kind of ['oll', 'pll']) {
      const link = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
      ).find((button) => button.textContent?.includes(kind.toUpperCase()))!;
      link.click();
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(`/algorithms/${kind}`);
      expect(link.getAttribute('aria-current')).toBe('page');
    }
  });
});
