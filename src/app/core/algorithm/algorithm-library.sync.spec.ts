import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { UserDataRepository } from '../local-storage/user-data-repository';
import { AlgorithmLibraryService } from './algorithm-library';
import { OLL_CASES, PLL_CASES, F2L_CASES } from './algorithm-cases';
import { f2lCaseForSlot } from './algorithm-cases/f2l/f2l-case';

/** テスト中に切り替える認証アカウント。 */
const account = { uid: 'alice', email: null, displayName: null, photoURL: null };

describe('手順の所有者と移行', () => {
  it('ゲストと各アカウントの同じケースを分離し、ログアウトでゲストへ戻る', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    await library.ready;
    const item = OLL_CASES[0];
    library.add(item, 'guest');
    auth.user.set(account);
    expect(library.algorithmsFor(item)).toEqual(item.algorithms);
    library.add(item, 'alice');
    auth.user.set({ ...account, uid: 'bob' });
    expect(library.algorithmsFor(item)).toEqual(item.algorithms);
    library.add(item, 'bob');
    auth.user.set(account);
    expect(library.algorithmsFor(item).at(-1)?.notation).toBe('alice');
    auth.user.set(null);
    expect(library.algorithmsFor(item).at(-1)?.notation).toBe('guest');
  });

  it('表示中のゲスト手順を操作してもアカウントへ自動移行せず、別所有者の同じIDを変更しない', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    await library.ready;
    const item = OLL_CASES[0];
    library.add(item, 'guest');
    const guest = library.displayedAlgorithmsFor(item).at(-1)!;
    auth.user.set(account);
    await library.merge([
      {
        caseKey: item.caseId,
        ownerId: 'alice',
        ownerType: 'account',
        custom: [{ id: guest.id, notation: 'account', builtIn: false }],
        schemaVersion: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(library.displayedAlgorithmsFor(item).filter((entry) => !entry.builtIn)).toHaveLength(2);
    library.setDisplayedFavorite(item, guest);
    expect(library.guestPreferences('OLL')[0].favoriteId).toBe(guest.id);
    expect(library.favoriteFor(item)?.id).toBe(item.algorithms[0].id);
    library.removeDisplayed(item, guest);
    expect(library.algorithmsFor(item).at(-1)?.notation).toBe('account');
    expect(library.guestPreferences('OLL')).toHaveLength(0);
    const owned = library.displayedAlgorithmsFor(item).at(-1)!;
    auth.user.set({ ...account, uid: 'bob' });
    library.removeDisplayed(item, owned);
    auth.user.set(account);
    expect(library.algorithmsFor(item).at(-1)?.notation).toBe('account');
  });

  it('指定種類のゲストだけを統合し、重複を除き、既存のお気に入りを維持する', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    await library.ready;
    const item = OLL_CASES[0];
    library.add(item, 'same');
    library.add(item, 'guest only');
    library.setFavorite(item, library.algorithmsFor(item).at(-1)!.id);
    library.add(PLL_CASES[0], 'PLL guest');
    auth.user.set(account);
    library.add(item, 'same');
    const favorite = library.algorithmsFor(item).at(-1)!;
    library.setFavorite(item, favorite.id);
    await library.importGuests('OLL', 'alice');
    expect(
      library
        .algorithmsFor(item)
        .filter((entry) => !entry.builtIn)
        .map((entry) => entry.notation),
    ).toEqual(['same', 'guest only']);
    expect(library.favoriteFor(item)?.id).toBe(favorite.id);
    expect(library.guestPreferences('OLL')).toHaveLength(0);
    expect(library.guestPreferences('PLL')).toHaveLength(1);
    await library.importGuests('OLL', 'alice');
    expect(library.algorithmsFor(item).filter((entry) => !entry.builtIn)).toHaveLength(2);
  });

  it('F2L各スロットの設定とお気に入りを独立して統合する', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    await library.ready;
    for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
      const item = f2lCaseForSlot(F2L_CASES[0], slot);
      library.add(item, slot);
      library.setFavorite(item, library.algorithmsFor(item).at(-1)!.id);
    }
    auth.user.set(account);
    await library.importGuests('F2L', 'alice');
    for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
      expect(library.favoriteFor(f2lCaseForSlot(F2L_CASES[0], slot))?.notation).toBe(slot);
    }
  });

  it('受信したお気に入りと削除を反映し、古い取得値で削除を取り消さない', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    TestBed.inject(AuthService).user.set(account);
    await library.ready;
    const item = OLL_CASES[0];
    const remote = {
      caseKey: item.caseId,
      custom: [{ id: 'remote', notation: 'remote move', builtIn: false }],
      favoriteId: 'remote',
      ownerId: 'alice',
      ownerType: 'account' as const,
      schemaVersion: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    await library.merge([remote]);
    expect(library.favoriteFor(item)?.notation).toBe('remote move');
    await library.merge([
      { ...remote, custom: [], favoriteId: undefined, updatedAt: '2026-01-03T00:00:00.000Z' },
    ]);
    await library.merge([remote]);
    expect(library.algorithmsFor(item)).toEqual(item.algorithms);
    expect(library.favoriteFor(item)?.id).toBe(item.algorithms[0].id);
  });

  it('移行の保存中にログアウトして編集したゲスト設定を削除しない', async () => {
    const library = TestBed.inject(AlgorithmLibraryService);
    const auth = TestBed.inject(AuthService);
    const repository = TestBed.inject(UserDataRepository);
    await library.ready;
    library.add(OLL_CASES[0], 'guest');
    const original = repository.putAlgorithmPreference.bind(repository);
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(repository, 'putAlgorithmPreference').mockImplementationOnce(async (entry) => {
      await barrier;
      await original(entry);
    });
    auth.user.set(account);
    const migration = library.importGuests('OLL', 'alice');
    await Promise.resolve();
    auth.user.set(null);
    library.add(OLL_CASES[0], 'new guest edit');
    release();
    await migration;
    expect(library.guestPreferences('OLL')).toHaveLength(1);
    expect(library.algorithmsFor(OLL_CASES[0]).at(-1)?.notation).toBe('new guest edit');
  });

  it('再起動時に保存済みの未送信設定を種類別の再送キューへ復元する', async () => {
    const repository = TestBed.inject(UserDataRepository);
    await repository.putAlgorithmPreference({
      caseKey: 'OLL-01',
      custom: [],
      ownerType: 'account',
      ownerId: 'alice',
      pendingSync: true,
      schemaVersion: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    const library = TestBed.inject(AlgorithmLibraryService);
    await library.ready;
    expect(library.mutations.OLL()).toHaveLength(1);
    expect(library.mutations.PLL()).toHaveLength(0);
    expect(library.mutations.F2L()).toHaveLength(0);
  });
});
