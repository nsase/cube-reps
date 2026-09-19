import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { F2L_CASES } from '../../../core/algorithm/algorithm-cases/f2l';
import { AlgorithmLibraryService } from '../../../core/algorithm/algorithm-library';
import { topLayerPatternFromScramble } from '../../../core/cube/cube-state';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { Algorithms } from '../algorithms';
import { AlgorithmCaseCard } from '../algorithm-case-card/algorithm-case-card';

describe('F2L共通カード', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: of({ kind: 'F2L' }) } },
      ],
    }),
  );

  it('41ケースを共通カードで番号順に表示し、グループと仮の上面図を表示する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    await fixture.whenStable();
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'app-algorithm-case-card',
    );
    expect(cards).toHaveLength(41);
    expect(Array.from(cards, (card) => card.querySelector('h2')!.textContent)).toEqual(
      F2L_CASES.map(({ name }) => name),
    );
    expect(Array.from(cards, (card) => card.querySelector('p')!.textContent)).toEqual(
      F2L_CASES.map(({ group }) => group),
    );
    const expected = topLayerPatternFromScramble(F2L_CASES[0].setup);
    const sticker = cards[0].querySelector<HTMLElement>('[data-x="1"][data-y="0"]')!;
    expect(sticker.dataset['color']).toBe(expected[0][1]);
  });

  it('共通の検索欄で番号・グループを絞り込み、該当なしと検索解除を表示する', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('app-algorithm-tools input') as HTMLInputElement;
    for (const [query, count] of [
      ['41', 1],
      ['Edge in Slot', 6],
      ['missing', 0],
      ['', 41],
    ] as const) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      const cards = element.querySelectorAll('app-algorithm-case-card');
      expect(cards).toHaveLength(count);
      if (query === '41') expect(cards[0].querySelector('h2')!.textContent).toBe('41');
      if (count === 0) expect(element.querySelector('.empty')).not.toBeNull();
    }
  });

  it('ダミーの案内と共通カードの操作ラベルを言語切替に追従させる', async () => {
    const fixture = TestBed.createComponent(Algorithms);
    const i18n = TestBed.inject(TranslocoService);
    for (const [lang, notice, copyLabel] of [
      ['ja', '仮の上面図', '手順をコピー'],
      ['en', 'temporary top-layer view', 'Copy algorithm'],
    ]) {
      await firstValueFrom(i18n.load(lang));
      i18n.setActiveLang(lang);
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain(notice);
      expect(
        fixture.nativeElement.querySelector(`button[aria-label="${copyLabel}"]`),
      ).not.toBeNull();
    }
  });

  it('共通カードでF2L手順を追加・お気に入り指定し、確認後に削除する', async () => {
    const fixture = TestBed.createComponent(AlgorithmCaseCard);
    // 組み込み手順の追加・修正に左右されず、カードの操作契約を検証する。
    const item = {
      ...F2L_CASES[0],
      algorithms: [{ id: 'test-built-in', notation: "R U R'", builtIn: true }],
    };
    fixture.componentRef.setInput('item', item);
    const library = TestBed.inject(AlgorithmLibraryService);
    await library.ready;
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('form input') as HTMLInputElement;
    input.value = "U R U' R'";
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(element.querySelectorAll('app-algorithm-row')).toHaveLength(2);
    expect(input.value).toBe('');
    const customRow = element.querySelector('app-algorithm-row:last-child')!;
    (customRow.querySelector('.star') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(element.querySelector('.favorite-algorithm code')!.textContent).toBe("U R U' R'");
    expect(library.caseKey(item)).toBe('F2L-01-FR');
    const confirm = vi.spyOn(TestBed.inject(ConfirmService), 'delete').mockReturnValue(of(false));
    (customRow.querySelector('.remove') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(element.querySelectorAll('app-algorithm-row')).toHaveLength(2);
    confirm.mockReturnValue(of(true));
    (customRow.querySelector('.remove') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(element.querySelectorAll('app-algorithm-row')).toHaveLength(1);
    expect(element.querySelector('.favorite-algorithm code')!.textContent).toBe(
      item.algorithms[0].notation,
    );
  });
});
