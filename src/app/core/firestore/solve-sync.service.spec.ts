import { GroupSyncService } from './group-sync.service';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { SolveMutation } from '../cube.models';
import { FirestoreSyncService } from './firestore-sync.service';
import { Solve } from '../cube.models';
import { SystemStore } from '../system.store';
import { FirestoreSolveRepository } from './firestore-solve.repository';
import { SolveSyncService } from './solve-sync.service';

describe('SolveSyncService', () => {
  const account = {
    uid: 'account-1',
    displayName: 'Cube User',
    email: 'cube@example.com',
    photoURL: null,
  };
  const solve: Solve = {
    id: '4d651998-42f1-4e63-9815-7f56bcac524d',
    time: 1234,
    scramble: 'R U',
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-03T10:00:00.000Z',
    ownerType: 'account',
    ownerId: account.uid,
    schemaVersion: 1,
    category: 'full',
    groupId: 'unclassified',
    penalty: 'none',
  };
  let auth: { user: ReturnType<typeof signal<typeof account | null>> };
  let cube: {
    ready: Promise<void>;
    solveSyncFinished: ReturnType<typeof vi.fn>;
    mergeSolves: ReturnType<typeof vi.fn>;
    reconcileMissingGroups: ReturnType<typeof vi.fn>;
  };
  let queue: { solveMutations: ReturnType<typeof signal<readonly SolveMutation[]>> };
  let cloud: {
    list: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    tombstone: ReturnType<typeof vi.fn>;
  };
  let system: { online: ReturnType<typeof signal<boolean>> };

  beforeEach(() => {
    auth = { user: signal<typeof account | null>(null) };
    queue = { solveMutations: signal<readonly SolveMutation[]>([]) };
    cube = {
      ready: Promise.resolve(),
      solveSyncFinished: vi.fn(async () => undefined),
      mergeSolves: vi.fn(async () => undefined),
      reconcileMissingGroups: vi.fn(async () => undefined),
    };
    cloud = {
      list: vi.fn(async () => [solve]),
      put: vi.fn(async () => undefined),
      tombstone: vi.fn(async () => undefined),
    };
    system = { online: signal(true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: GroupSyncService, useValue: { refresh: vi.fn(async () => true) } },
        { provide: AuthService, useValue: auth },
        { provide: CubeService, useValue: cube },
        { provide: FirestoreSyncService, useValue: queue },
        { provide: FirestoreSolveRepository, useValue: cloud },
        { provide: SystemStore, useValue: system },
      ],
    });
  });

  it('ログイン時にアカウントのSolveを一度取得してローカルへ統合する', async () => {
    const sync = TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();

    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledWith(account.uid));
    expect(cube.mergeSolves).toHaveBeenCalledWith([solve]);
    expect(sync.phase()).toBe('synced');
  });

  it('明示的な更新でアカウントのSolveを再取得する', async () => {
    const sync = TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(1));

    sync.refresh();

    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(2));
  });

  it('オフライン移行を表示へ反映し、オンライン復帰時に再取得する', async () => {
    const sync = TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(1));

    system.online.set(false);
    TestBed.tick();
    expect(cloud.list).toHaveBeenCalledTimes(1);
    expect(sync.phase()).toBe('offline');

    system.online.set(true);
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(2));
    expect(sync.phase()).toBe('synced');
  });

  it('オフライン中のログインではFirestoreキャッシュからの取得を試す', async () => {
    system.online.set(false);
    const sync = TestBed.inject(SolveSyncService);

    auth.user.set(account);
    TestBed.tick();

    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledWith(account.uid));
    expect(cube.mergeSolves).toHaveBeenCalledWith([solve]);
    expect(sync.phase()).toBe('offline');
  });

  it('追加・更新と削除を別のFirestore操作へ転送する', async () => {
    TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();

    queue.solveMutations.set([{ kind: 'put', data: solve }]);
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.put).toHaveBeenCalledWith(account.uid, solve));

    queue.solveMutations.set([{ kind: 'delete', data: { ...solve, deletedAt: solve.updatedAt } }]);
    TestBed.tick();
    await vi.waitFor(() =>
      expect(cloud.tombstone).toHaveBeenCalledWith(
        account.uid,
        expect.objectContaining({ id: solve.id }),
      ),
    );
  });
  it('ログアウト中や別アカウントのキューではFirestoreへアクセスしない', async () => {
    TestBed.inject(SolveSyncService);
    queue.solveMutations.set([{ kind: 'put', data: solve }]);
    TestBed.tick();
    expect(cloud.list).not.toHaveBeenCalled();
    expect(cloud.put).not.toHaveBeenCalled();
    auth.user.set({ ...account, uid: 'other' });
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledWith('other'));
    expect(cloud.put).not.toHaveBeenCalled();
    expect(queue.solveMutations()).toHaveLength(1);
  });

  it('一括移行の一部失敗を別記録の成功で隠さず、失敗分だけ再試行する', async () => {
    const sync = TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    cloud.put.mockRejectedValueOnce(new Error('offline'));
    queue.solveMutations.set([
      { kind: 'put', data: solve },
      { kind: 'put', data: { ...solve, id: 'second' } },
    ]);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('error'));
    expect(cloud.put).toHaveBeenCalledTimes(2);
    sync.retry();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    expect(cloud.put).toHaveBeenCalledTimes(3);
    expect(cloud.put.mock.calls[2][1].id).toBe(solve.id);
  });
  it('取得中にアカウントが切り替わった場合、古い取得結果を取り込まない', async () => {
    let complete!: (records: (typeof solve)[]) => void;
    cloud.list.mockReturnValueOnce(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(1));
    auth.user.set(null);
    TestBed.tick();
    complete([solve]);
    await Promise.resolve();
    expect(cube.mergeSolves).not.toHaveBeenCalled();
  });

  it('取得結果のうちログイン先以外の所有者を取り込まない', async () => {
    cloud.list.mockResolvedValueOnce([solve, { ...solve, id: 'other', ownerId: 'other' }]);
    TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(cube.mergeSolves).toHaveBeenCalledWith([solve]));
  });
  it('グループ取得完了を待ってからSolveを取得し、取得成功後だけ所属を整理する', async () => {
    let finish!: (ok: boolean) => void;
    const groups = TestBed.inject(GroupSyncService);
    vi.mocked(groups.refresh).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(groups.refresh).toHaveBeenCalledOnce());
    expect(cloud.list).not.toHaveBeenCalled();
    finish(true);
    await vi.waitFor(() => expect(cube.reconcileMissingGroups).toHaveBeenCalledWith(account.uid));
    expect(cube.mergeSolves).toHaveBeenCalledWith([solve]);
  });

  it('グループ取得失敗時はSolveの取得も所属整理も行わず再試行できる', async () => {
    vi.mocked(TestBed.inject(GroupSyncService).refresh).mockResolvedValueOnce(false);
    const service = TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() => expect(service.phase()).toBe('error'));
    expect(cloud.list).not.toHaveBeenCalled();
    expect(cube.reconcileMissingGroups).not.toHaveBeenCalled();
    await service.retry();
    expect(cube.reconcileMissingGroups).toHaveBeenCalledWith(account.uid);
  });
});
