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
    expect(rows[0].querySelector('app-algorithm-owner [role="img"]')).toBeNull();
    const guest = rows.find((row) => row.textContent?.includes('guest move'))!;
    const account = rows.find((row) => row.textContent?.includes('account move'))!;
    expect(guest.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Not linked to an account',
    );
    expect(account.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('Alice');
    (guest.querySelector('.star') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect((guest.querySelector('.star') as HTMLButtonElement).disabled).toBe(true);
    expect(library.guestPreferences('PLL')[0].favoriteId).toBeUndefined();
    expect(library.favoriteFor(item)?.id).toBe(item.algorithms[0].id);
    expect(library.guestPreferences('PLL')).toHaveLength(1);
  });

  it('ログアウト・別アカウントへの切替後も全所有者の手順を表示し、本人以外の削除を無効にする', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    await library.ready;
    const item = PLL_CASES[0];
    library.add(item, 'guest move');
    const alice = { uid: 'alice', displayName: 'Alice', email: null, photoURL: null };
    const bob = { ...alice, uid: 'bob', displayName: 'Bob' };
    auth.user.set(alice);
    library.add(item, 'alice move');
    auth.user.set(bob);
    library.add(item, 'bob move');
    const fixture = TestBed.createComponent(AlgorithmPanel);
    fixture.componentRef.setInput('item', item);
    for (const user of [null, alice, bob]) {
      auth.user.set(user);
      await fixture.whenStable();
      const rows = [
        ...fixture.nativeElement.querySelectorAll('app-algorithm-row'),
      ] as HTMLElement[];
      for (const owner of ['guest', 'alice', 'bob']) {
        const row = rows.find((entry) => entry.textContent?.includes(owner + ' move'))!;
        expect(row).toBeTruthy();
        expect(row.querySelector('app-owner-avatar')).not.toBeNull();
        expect((row.querySelector('.remove') as HTMLButtonElement).disabled).toBe(
          owner !== 'guest' && owner !== user?.uid,
        );
      }
    }
  });

  it('別所有者の手順を残しつつ、お気に入り欄・星・強調行を現在の利用者の1件に揃える', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    await library.ready;
    const item = PLL_CASES[0];
    library.add(item, 'guest favorite');
    library.setFavorite(item, library.algorithmsFor(item).at(-1)!.id);
    const alice = { uid: 'alice', displayName: 'Alice', email: null, photoURL: null };
    auth.user.set(alice);
    library.add(item, 'alice favorite');
    library.setFavorite(item, library.algorithmsFor(item).at(-1)!.id);
    const fixture = TestBed.createComponent(AlgorithmPanel);
    fixture.componentRef.setInput('item', item);
    for (const user of [alice, null]) {
      auth.user.set(user);
      await fixture.whenStable();
      const expected = user ? 'alice favorite' : 'guest favorite';
      expect(fixture.nativeElement.querySelectorAll('app-algorithm-row.preferred')).toHaveLength(1);
      expect(fixture.nativeElement.querySelectorAll('.star.active')).toHaveLength(1);
      expect(
        fixture.nativeElement.querySelector('app-algorithm-row.preferred code').textContent,
      ).toBe(expected);
      expect(fixture.nativeElement.querySelector('.favorite-algorithm code').textContent).toBe(
        expected,
      );
      expect(fixture.nativeElement.textContent).toContain('guest favorite');
      expect(fixture.nativeElement.textContent).toContain('alice favorite');
    }
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
