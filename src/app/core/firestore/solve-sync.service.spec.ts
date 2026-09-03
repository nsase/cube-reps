import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { CubeService, SolveMutation } from '../cube';
import { Solve } from '../cube.models';
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
    watch: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    tombstone: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    auth = { user: signal<typeof account | null>(null) };
    cube = {
      ready: Promise.resolve(),
      solveMutations: signal<readonly SolveMutation[]>([]),
      mergeAccountSolves: vi.fn(async () => undefined),
    };
    cloud = {
      watch: vi.fn(async () => () => undefined),
      put: vi.fn(async () => undefined),
      tombstone: vi.fn(async () => undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CubeService, useValue: cube },
        { provide: FirestoreSolveRepository, useValue: cloud },
      ],
    });
  });

  it('ログイン時にアカウントの変更を購読し、受信Solveをローカルへ統合する', async () => {
    let receive: ((solves: Solve[], pending: boolean, fromCache: boolean) => void) | undefined;
    cloud.watch.mockImplementation(
      async (
        _userId: string,
        next: (solves: Solve[], pending: boolean, fromCache: boolean) => void,
      ) => {
        receive = next;
        return () => undefined;
      },
    );
    const sync = TestBed.inject(SolveSyncService);
    auth.user.set(account);
    TestBed.tick();
    await vi.waitFor(() =>
      expect(cloud.watch).toHaveBeenCalledWith(
        account.uid,
        expect.any(Function),
        expect.any(Function),
      ),
    );

    receive?.([solve], false, false);
    await vi.waitFor(() =>
      expect(cube.mergeAccountSolves).toHaveBeenCalledWith(account.uid, [solve]),
    );
    expect(sync.phase()).toBe('synced');
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
