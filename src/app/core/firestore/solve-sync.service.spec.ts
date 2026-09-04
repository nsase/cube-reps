import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { CubeService, SolveMutation } from '../cube';
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
    date: '2026-09-03T10:00:00.000Z',
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
    solveMutations: ReturnType<typeof signal<readonly SolveMutation[]>>;
    mergeAccountSolves: ReturnType<typeof vi.fn>;
  };
  let cloud: {
    list: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    tombstone: ReturnType<typeof vi.fn>;
  };
  let system: { online: ReturnType<typeof signal<boolean>> };

  beforeEach(() => {
    auth = { user: signal<typeof account | null>(null) };
    cube = {
      ready: Promise.resolve(),
      solveMutations: signal<readonly SolveMutation[]>([]),
      mergeAccountSolves: vi.fn(async () => undefined),
    };
    cloud = {
      list: vi.fn(async () => [solve]),
      put: vi.fn(async () => undefined),
      tombstone: vi.fn(async () => undefined),
    };
    system = { online: signal(true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CubeService, useValue: cube },
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
    expect(cube.mergeAccountSolves).toHaveBeenCalledWith(account.uid, [solve]);
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
    expect(cube.mergeAccountSolves).toHaveBeenCalledWith(account.uid, [solve]);
    expect(sync.phase()).toBe('offline');
  });

  it('追加・更新と削除を別のFirestore操作へ転送する', async () => {
    TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();

    cube.solveMutations.set([{ kind: 'put', solve }]);
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.put).toHaveBeenCalledWith(account.uid, solve));

    cube.solveMutations.set([{ kind: 'delete', solve: { ...solve, deletedAt: solve.updatedAt } }]);
    TestBed.tick();
    await vi.waitFor(() =>
      expect(cloud.tombstone).toHaveBeenCalledWith(
        account.uid,
        expect.objectContaining({ id: solve.id }),
      ),
    );
  });
});
