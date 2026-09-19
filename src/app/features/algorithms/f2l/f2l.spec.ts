import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { F2L_CASES } from '../../../core/algorithm/algorithm-cases/f2l/f2l-cases';
import { F2l } from './f2l';
import { F2lCaseCard } from './f2l-case-card/f2l-case-card';

describe('F2l', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('41ケースを番号順に表示し、独立した一意のIDを持つ', async () => {
    const fixture = TestBed.createComponent(F2l);
    await fixture.whenStable();
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('app-f2l-case-card');
    expect(cards).toHaveLength(41);
    expect(Array.from(cards, (card) => card.querySelector('h3')!.textContent)).toEqual(
      Array.from({ length: 41 }, (_, i) => `F2L ${i + 1}`),
    );
    expect(new Set(F2L_CASES.map((item) => item.id)).size).toBe(41);
    expect(F2L_CASES.every((item) => item.id !== String(item.number))).toBe(true);
  });

  it('ダミーの案内とカード表示を言語切替に追従させる', async () => {
    const fixture = TestBed.createComponent(F2l);
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
    fixture.componentRef.setInput('item', { ...F2L_CASES[0], number: 9, solve: 'U', setup: "U'" });
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
