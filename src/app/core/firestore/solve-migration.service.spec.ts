import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticatedUser } from '../auth/auth.gateway';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { Solve } from '../cube.models';
import { FirestoreSolveRepository } from './firestore-solve.repository';
import { SolveMigrationService } from './solve-migration.service';

const account: AuthenticatedUser = {
  uid: 'account-1',
  displayName: 'Cube User',
  email: 'cube@example.com',
  photoURL: null,
};

const localSolve = (overrides: Partial<Solve> = {}): Solve => ({
  id: 'solve-1',
  time: 12345,
  scramble: 'R U',
  date: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:01:00.000Z',
  ownerType: 'guest',
  ownerId: 'guest-1',
  schemaVersion: 1,
  category: 'full',
  groupId: 'unclassified',
  penalty: 'none',
  ...overrides,
});

describe('SolveMigrationService', () => {
  const user = signal<AuthenticatedUser | null>(null);
  const solves = signal<Solve[]>([]);
  let cloud: { list: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    user.set(null);
    solves.set([]);
    cloud = { list: vi.fn().mockResolvedValue([]), put: vi.fn().mockResolvedValue(undefined) };
    TestBed.configureTestingModule({
      providers: [
        SolveMigrationService,
        { provide: AuthService, useValue: { user } },
        { provide: CubeService, useValue: { ready: Promise.resolve(), solves } },
        { provide: FirestoreSolveRepository, useValue: cloud },
      ],
    });
  });

  it('ログインだけではアップロードせず、対象件数とアカウントを準備する', async () => {
    solves.set([localSolve(), localSolve({ id: 'solve-2' })]);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));

    expect(migration.state().targetCount).toBe(2);
    expect(migration.account()?.email).toBe('cube@example.com');
    expect(cloud.put).not.toHaveBeenCalled();
  });

  it('明示操作時だけUUIDごとに保存し、再検査では重複登録しない', async () => {
    const solve = localSolve();
    solves.set([solve]);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));

    await migration.migrate();
    expect(cloud.put).toHaveBeenCalledWith(account.uid, solve);
    expect(migration.state().phase).toBe('completed');
    expect(solves()).toEqual([solve]);

    cloud.list.mockResolvedValue([{ ...solve, ownerType: 'account', ownerId: account.uid }]);
    migration.retryInspection();
    await vi.waitFor(() => expect(migration.state().phase).toBe('completed'));
    expect(migration.state().targetCount).toBe(0);
    expect(cloud.put).toHaveBeenCalledTimes(1);
  });

  it('クラウド側が新しい競合Solveを上書きしない', async () => {
    solves.set([localSolve()]);
    cloud.list.mockResolvedValue([
      localSolve({
        time: 15000,
        updatedAt: '2026-09-01T10:02:00.000Z',
        ownerType: 'account',
        ownerId: account.uid,
      }),
    ]);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();

    await vi.waitFor(() => expect(migration.state().phase).toBe('completed'));
    expect(migration.state().skippedCount).toBe(1);
    expect(cloud.put).not.toHaveBeenCalled();
  });

  it('部分失敗したSolveだけを識別して再試行する', async () => {
    solves.set([localSolve(), localSolve({ id: 'solve-2' })]);
    cloud.put.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));

    await migration.migrate();
    expect(migration.state()).toMatchObject({
      phase: 'partial-failure',
      uploadedCount: 1,
      failedCount: 1,
    });

    await migration.migrate();
    expect(migration.state()).toMatchObject({ phase: 'completed', failedCount: 0 });
    expect(cloud.put).toHaveBeenCalledTimes(3);
  });

  it('アカウント切替後に古いアカウントへの残りの保存を開始しない', async () => {
    solves.set([localSolve(), localSolve({ id: 'solve-2' })]);
    let finishFirst: (() => void) | undefined;
    cloud.put.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        }),
    );
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));

    const running = migration.migrate();
    await vi.waitFor(() => expect(cloud.put).toHaveBeenCalledTimes(1));
    user.set({ ...account, uid: 'account-2', email: 'other@example.com' });
    TestBed.flushEffects();
    finishFirst?.();
    await running;

    expect(cloud.put).toHaveBeenCalledTimes(1);
    expect(migration.account()?.uid).toBe('account-2');
  });
});
