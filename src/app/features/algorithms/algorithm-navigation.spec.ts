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

  // 全41ケースの実手順とMaterialボタンを描画するため、並列実行時の余裕を持たせる。
  it('選択画面の言語変更を反映し、F2Lページへ移動する', async () => {
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
  }, 15000);

  it('F2LのURLを直接開き、他の種類への切り替えを表示する', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/algorithms/f2l', Algorithms);
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.querySelector('h2')!.textContent).toBe('F2L');
    expect(
      harness.routeNativeElement!.querySelectorAll('app-algorithm-kind-links button'),
    ).toHaveLength(3);
    expect(
      harness.routeNativeElement!.querySelector(
        'app-algorithm-kind-links button[aria-checked="true"]',
      )!.textContent,
    ).toContain('F2L');
  });

  it('選択項目に種類に対応する説明とリンクを表示する', async () => {
    const fixture = TestBed.createComponent(AlgorithmChoice);
    fixture.componentRef.setInput('kind', 'oll');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/algorithms/oll');
    expect(fixture.nativeElement.textContent).toContain('57');
  });

  it('共通の切り替えボタンでOLL・PLL・F2Lへ移動する', async () => {
    const fixture = TestBed.createComponent(AlgorithmKindLinks);
    await fixture.whenStable();
    for (const kind of ['oll', 'pll', 'f2l']) {
      const link = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
      ).find((button) => button.textContent?.includes(kind.toUpperCase()))!;
      link.click();
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(`/algorithms/${kind}`);
      expect(link.getAttribute('aria-checked')).toBe('true');
    }
  });

  it('矢印キーで種別を切り替え、戻る操作後の選択も同期する', async () => {
    const fixture = TestBed.createComponent(AlgorithmKindLinks);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/algorithms/f2l');
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, bubbles: true }),
    );
    await fixture.whenStable();
    expect(router.url).toBe('/algorithms/oll');
    expect(buttons[1].getAttribute('aria-checked')).toBe('true');
    await router.navigateByUrl('/algorithms/f2l');
    await fixture.whenStable();
    expect(buttons[0].getAttribute('aria-checked')).toBe('true');
    expect(buttons[1].getAttribute('aria-checked')).toBe('false');
  });

  it('外部からのルート変更でも種別グループの選択を同期する', async () => {
    const fixture = TestBed.createComponent(AlgorithmKindLinks);
    await fixture.whenStable();
    for (const kind of ['pll', 'f2l', 'oll']) {
      await TestBed.inject(Router).navigateByUrl(`/algorithms/${kind}`);
      await fixture.whenStable();
      const selected = (fixture.nativeElement as HTMLElement).querySelectorAll(
        'button[aria-checked="true"]',
      );
      expect(selected).toHaveLength(1);
      expect(selected[0].textContent).toContain(kind.toUpperCase());
    }
  });
});
