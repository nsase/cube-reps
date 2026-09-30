import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { AlgorithmLibraryService } from '../algorithm/algorithm-library';
import { OLL_CASES, PLL_CASES } from '../algorithm/algorithm-cases';
import { UserDataRepository } from '../local-storage/user-data-repository';
import { AlgorithmSyncService } from './algorithm-sync.service';
import { FirestoreAlgorithmRepository } from './firestore-algorithm.repository';
import { AlgorithmPreference } from '../cube/cube.models';

/** 認証済みユーザーのテスト表示情報。 */
const account = { uid: 'alice', email: 'alice@example.com', displayName: 'Alice', photoURL: null };
/** クラウドから復元するケース設定。 */
function preference(caseKey: string, ownerId = 'alice'): AlgorithmPreference {
  return {
    caseKey,
    ownerId,
    ownerType: 'account',
    custom: [{ id: 'remote', notation: 'R U', builtIn: false }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    schemaVersion: 3,
  };
}

describe('AlgorithmSyncService', () => {
  let auth: AuthService;
  let library: AlgorithmLibraryService;
  let sync: AlgorithmSyncService;
  let cloud: { list: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  beforeEach(async () => {
    cloud = {
      list: vi.fn(async () => [] as AlgorithmPreference[]),
      put: vi.fn(async () => undefined),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: FirestoreAlgorithmRepository, useValue: cloud }],
    });
    auth = TestBed.inject(AuthService);
    library = TestBed.inject(AlgorithmLibraryService);
    sync = TestBed.inject(AlgorithmSyncService);
    await library.ready;
    TestBed.tick();
  });

  it('ログイン時は画面に関係なく全種類、ページ更新では指定種類だけ取得する', async () => {
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    expect(cloud.list.mock.calls).toEqual(
      expect.arrayContaining([
        ['alice', 'OLL'],
        ['alice', 'PLL'],
        ['alice', 'F2L'],
      ]),
    );
    expect(cloud.list).toHaveBeenCalledTimes(3);
    cloud.list.mockClear();
    await sync.refresh('OLL');
    expect(cloud.list.mock.calls).toEqual([['alice', 'OLL']]);
  });

  it('接続復帰では表示種類だけ取得し、ページを閉じている場合は取得しない', async () => {
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    cloud.list.mockClear();
    sync.activeKind.set('PLL');
    window.dispatchEvent(new Event('offline'));
    TestBed.tick();
    window.dispatchEvent(new Event('online'));
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.list.mock.calls).toEqual([['alice', 'PLL']]));
    cloud.list.mockClear();
    sync.activeKind.set(null);
    window.dispatchEvent(new Event('offline'));
    TestBed.tick();
    window.dispatchEvent(new Event('online'));
    TestBed.tick();
    await Promise.resolve();
    expect(cloud.list).not.toHaveBeenCalled();
  });

  it('保存後に追加と削除を送信し、空設定で別端末の古い手順を消す', async () => {
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    library.add(OLL_CASES[0], 'R U');
    await vi.waitFor(() => {
      TestBed.tick();
      expect(cloud.put).toHaveBeenCalledTimes(1);
    });
    const custom = library.algorithmsFor(OLL_CASES[0]).at(-1)!;
    library.setFavorite(OLL_CASES[0], custom.id);
    await vi.waitFor(() => {
      TestBed.tick();
      expect(cloud.put).toHaveBeenCalledTimes(2);
    });
    library.remove(OLL_CASES[0], custom.id);
    await vi.waitFor(() => {
      TestBed.tick();
      expect(cloud.put).toHaveBeenCalledTimes(3);
    });
    expect(cloud.put.mock.lastCall).toEqual([
      'alice',
      expect.objectContaining({ custom: [], favoriteId: undefined }),
    ]);
    expect(
      (await TestBed.inject(UserDataRepository).load()).algorithmPreferences[0].custom,
    ).toEqual([]);
  });

  it('未送信変更を取得値で上書きせず、送信失敗を再試行する', async () => {
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    cloud.put.mockRejectedValueOnce(new Error('offline'));
    library.add(OLL_CASES[0], 'local');
    await vi.waitFor(() => {
      TestBed.tick();
      expect(sync.phase()).toBe('error');
    });
    cloud.list.mockResolvedValue([preference(OLL_CASES[0].caseId)]);
    await sync.refresh('OLL');
    expect(library.algorithmsFor(OLL_CASES[0]).at(-1)?.notation).toBe('local');
    await sync.retry();
    expect(cloud.put).toHaveBeenCalledTimes(2);
    expect(sync.phase()).toBe('synced');
  });

  it('表示外の種類でもオンライン復帰時に失敗した送信を再試行する', async () => {
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    cloud.put.mockRejectedValueOnce(new Error('network'));
    library.add(OLL_CASES[0], 'retry');
    await vi.waitFor(() => {
      TestBed.tick();
      expect(sync.phase()).toBe('error');
    });
    sync.activeKind.set('PLL');
    window.dispatchEvent(new Event('offline'));
    TestBed.tick();
    window.dispatchEvent(new Event('online'));
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.put).toHaveBeenCalledTimes(2));
    expect(cloud.put.mock.lastCall?.[1]).toMatchObject({ caseKey: OLL_CASES[0].caseId });
  });

  it('古い送信失敗を再試行しても、その後に成功した削除を取り消さない', async () => {
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    cloud.put.mockRejectedValueOnce(new Error('network'));
    library.add(OLL_CASES[0], 'removed');
    await vi.waitFor(() => {
      TestBed.tick();
      expect(sync.phase()).toBe('error');
    });
    library.remove(OLL_CASES[0], library.algorithmsFor(OLL_CASES[0]).at(-1)!.id);
    await vi.waitFor(() => {
      TestBed.tick();
      expect(cloud.put).toHaveBeenCalledTimes(2);
    });
    await sync.retry();
    expect(cloud.put).toHaveBeenCalledTimes(2);
    expect(cloud.put.mock.lastCall?.[1]).toMatchObject({ custom: [] });
    expect(sync.phase()).toBe('synced');
  });

  it('認証変更前に開始した取得結果を別アカウントへ反映しない', async () => {
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    let resolve!: (value: AlgorithmPreference[]) => void;
    cloud.list.mockImplementationOnce(
      () =>
        new Promise<AlgorithmPreference[]>((done) => {
          resolve = done;
        }),
    );
    const pending = sync.refresh('PLL');
    await vi.waitFor(() => expect(resolve).toBeDefined());
    auth.user.set({ ...account, uid: 'bob' });
    TestBed.tick();
    resolve([preference(PLL_CASES[0].caseId)]);
    expect(await pending).toBe(false);
    expect(library.algorithmsFor(PLL_CASES[0])).toEqual(PLL_CASES[0].algorithms);
  });
});
