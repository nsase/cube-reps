import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { F2L_CASES } from '../../../core/algorithm/algorithm-cases/f2l';
import { Algorithms } from '../algorithms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { F2lCaseCard } from './f2l-case-card/f2l-case-card';

describe('F2l', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: of({ kind: 'F2L' }) } },
      ],
    }),
  );

  it('41ケースを番号順に表示する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    await fixture.whenStable();
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('app-f2l-case-card');
    expect(cards).toHaveLength(41);
    expect(Array.from(cards, (card) => card.querySelector('h3')!.textContent)).toEqual(
      Array.from({ length: 41 }, (_, i) => `F2L ${i + 1}`),
    );
  });

  it('共通の検索欄でF2L番号を絞り込み、該当なしと検索解除を表示する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('app-algorithm-tools input') as HTMLInputElement;
    for (const [query, count] of [
      ['41', 1],
      ['missing', 0],
      ['', 41],
    ] as const) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(element.querySelectorAll('app-f2l-case-card')).toHaveLength(count);
      expect(element.querySelectorAll('app-algorithm-case-card')).toHaveLength(0);
      if (query === '41') expect(element.querySelector('h3')!.textContent).toBe('F2L 41');
      if (count === 0) expect(element.querySelector('.empty')).not.toBeNull();
    }
  });

  it('ダミーの案内とカード表示を言語切替に追従させる', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    const i18n = TestBed.inject(TranslocoService);
    for (const [lang, notice, status] of [
      ['ja', 'F2Lの41ケース', 'ダミー'],
      ['en', 'Browse 41 F2L cases', 'Dummy'],
    ]) {
      await firstValueFrom(i18n.load(lang));
      i18n.setActiveLang(lang);
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain(notice);
      expect(fixture.nativeElement.querySelector('.status').textContent).toBe(status);
    }
  });
});

describe('F2lCaseCard', () => {
  it('渡されたケースの番号とSolve・Setupを1つずつ表示する', async () => {
    const fixture = TestBed.createComponent(F2lCaseCard);
    fixture.componentRef.setInput('item', {
      ...F2L_CASES[0],
      number: '9',
      algorithms: [{ id: 'test', notation: 'U', builtIn: true }],
      setup: "U'",
    });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h3')!.textContent).toBe('F2L 9');
    expect(Array.from(element.querySelectorAll('dt'), (node) => node.textContent)).toEqual([
      'Solve',
      'Setup',
    ]);
    expect(Array.from(element.querySelectorAll('dd'), (node) => node.textContent)).toEqual([
      'U',
      "U'",
    ]);
  });
});
