import { AuthService } from '../../../../core/auth/auth.service';
import { AccountStore } from '../../../../core/account.store';
import { TestBed } from '@angular/core/testing';
import { PLL_CASES } from '../../../../core/algorithm/algorithm-cases';
import { AlgorithmLibraryService } from '../../../../core/algorithm/algorithm-library';
import { AlgorithmPanel } from './algorithm-panel';

describe('AlgorithmPanel', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [AlgorithmPanel] }).compileComponents();
  });

  it('登録済み手順を行コンポーネントとして描画する', async () => {
    const fixture = TestBed.createComponent(AlgorithmPanel);
    fixture.componentRef.setInput('item', PLL_CASES[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-algorithm-row')).toHaveLength(
      PLL_CASES[0].algorithms.length,
    );
  });

  it('連番の代わりに組み込み・ゲスト・アカウントを同じ一覧で区別して表示する', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    await library.ready;
    const item = PLL_CASES[0];
    library.add(item, 'guest move');
    auth.user.set({ uid: 'alice', displayName: 'Alice', email: null, photoURL: null });
    TestBed.inject(AccountStore).load([
      { uid: 'alice', displayName: 'Alice', email: null, photoURL: null },
    ]);
    library.add(item, 'account move');
    const fixture = TestBed.createComponent(AlgorithmPanel);
    fixture.componentRef.setInput('item', item);
    await fixture.whenStable();
    const rows = [...fixture.nativeElement.querySelectorAll('app-algorithm-row')] as HTMLElement[];
    expect(fixture.nativeElement.querySelector('.rank')).toBeNull();
    expect(rows[0].querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Built-in algorithm',
    );
    const guest = rows.find((row) => row.textContent?.includes('guest move'))!;
    const account = rows.find((row) => row.textContent?.includes('account move'))!;
    expect(guest.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Not linked to an account',
    );
    expect(account.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('Alice');
    (guest.querySelector('.star') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(library.guestPreferences('PLL')[0].favoriteId).toBe(
      library.displayedAlgorithmsFor(item).find((entry) => entry.notation === 'guest move')?.id,
    );
    expect(library.favoriteFor(item)?.id).toBe(item.algorithms[0].id);
    expect(library.guestPreferences('PLL')).toHaveLength(1);
  });

  it('入力したユーザー手順を追加し、入力欄を空にする', async () => {
    const fixture = TestBed.createComponent(AlgorithmPanel);
    fixture.componentRef.setInput('item', PLL_CASES[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'custom algorithm';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const library = TestBed.inject(AlgorithmLibraryService);
    expect(library.algorithmsFor(PLL_CASES[0]).at(-1)?.notation).toBe('custom algorithm');
    expect(input.value).toBe('');
  });
});
