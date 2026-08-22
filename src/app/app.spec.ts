import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { CubeService } from './core/cube';
import { routes } from './app.routes';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('保存済み設定がなければ英語で表示する', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/timer');
    await firstValueFrom(TestBed.inject(TranslocoService).load('en'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('nav a em')?.textContent).toContain('Timer');
    expect(document.documentElement.lang).toBe('en');
  });

  it('言語選択肢はデフォルト言語の英語を先頭に表示する', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.header-tools select option',
      ) as NodeListOf<HTMLOptionElement>,
    );
    expect(options.map((option) => option.value)).toEqual(['en', 'ja']);
    expect(options.map((option) => option.textContent)).toEqual(['English', '日本語']);
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/timer');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('PRACTICE SESSION');
  });

  it('ブランドロゴをSVGで表示する', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const logo = fixture.nativeElement.querySelector('.brand img') as HTMLImageElement;
    expect(logo.getAttribute('src')).toBe('cube-flow-mark.svg');
    expect(logo.getAttribute('alt')).toBe('');
  });

  it('タイマー画面に主要な操作要素を同時に構成する', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/timer');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-timer-settings')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-timer-clock strong')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-timer-scramble p')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-timer-scramble app-cube-net')).toBeTruthy();
  });

  it('履歴のURLへ移動してルートdataの見出しを表示する', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/history');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('YOUR PROGRESS');
  });

  it('OLLのURLへ直接移動してOLL一覧を表示する', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/algorithms/oll');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('ALGORITHM LIBRARY');
    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(57);
  });

  it('PLLのURLへ直接移動してPLL一覧を表示する', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/algorithms/pll');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-case-card')).toHaveLength(21);
  });

  it('履歴を100件ずつ表示し、Paginatorの言語切替を反映する', async () => {
    const cube = TestBed.inject(CubeService);
    cube.solves.set(
      Array.from({ length: 101 }, (_, index) => ({
        id: String(index + 1),
        time: 1000 + index,
        scramble: 'R U',
        date: new Date(index).toISOString(),
        category: 'full' as const,
        groupId: 'unclassified',
        penalty: 'none' as const,
      })),
    );
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/history');
    await firstValueFrom(TestBed.inject(TranslocoService).load('en'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-solve-record')).toHaveLength(100);
    const nextPage = fixture.nativeElement.querySelector(
      '.mat-mdc-paginator-navigation-next',
    ) as HTMLButtonElement;
    expect(nextPage.getAttribute('aria-label')).toBe('Next page');
    nextPage.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-solve-record')).toHaveLength(1);

    const i18n = TestBed.inject(TranslocoService);
    await firstValueFrom(i18n.load('ja'));
    i18n.setActiveLang('ja');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(nextPage.getAttribute('aria-label')).toBe('次のページ');
  });

  it('表示言語を日本語へ切り替えて選択を保存する', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/timer');
    fixture.detectChanges();
    await fixture.whenStable();

    const language = fixture.nativeElement.querySelector(
      '.header-tools select',
    ) as HTMLSelectElement;
    language.value = 'ja';
    language.dispatchEvent(new Event('change'));
    await firstValueFrom(TestBed.inject(TranslocoService).load('ja'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('nav a em')?.textContent).toContain('タイマー');
    expect(fixture.nativeElement.querySelector('app-timer-settings strong')?.textContent).toContain(
      '未分類',
    );
    expect(localStorage.getItem('cube-flow.language')).toBe('ja');
    expect(document.documentElement.lang).toBe('ja');
  });
});
