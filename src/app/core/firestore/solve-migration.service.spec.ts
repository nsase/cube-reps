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
  let assignSolveToAccount: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    user.set(null);
    solves.set([]);
    cloud = { list: vi.fn().mockResolvedValue([]), put: vi.fn().mockResolvedValue(undefined) };
    assignSolveToAccount = vi.fn(async (solve: Solve, accountId: string) => {
      solves.update((items) =>
        items.map((item) =>
          item.id === solve.id ? { ...item, ownerType: 'account', ownerId: accountId } : item,
        ),
      );
    });
    TestBed.configureTestingModule({
      providers: [
        SolveMigrationService,
        { provide: AuthService, useValue: { user } },
        {
          provide: CubeService,
          useValue: {
            ready: Promise.resolve(),
            solves,
            guestSolves: () =>
              solves().filter(
                (solve) => solve.ownerType === 'guest' && solve.ownerId === 'guest-1',
              ),
            isCurrentGuestSolveIn: (currentSolves: readonly Solve[], solve: Solve) =>
              currentSolves.some(
                (item) =>
                  item.id === solve.id &&
                  item.ownerType === 'guest' &&
                  item.ownerId === 'guest-1' &&
                  item.updatedAt === solve.updatedAt,
              ),
            isCurrentGuestSolve: (solve: Solve) =>
              solves().some(
                (item) =>
                  item.id === solve.id &&
                  item.ownerType === 'guest' &&
                  item.ownerId === 'guest-1' &&
                  item.updatedAt === solve.updatedAt,
              ),
            assignSolveToAccount,
          },
        },
        { provide: FirestoreSolveRepository, useValue: cloud },
      ],
    });
  });

  it('同期済みまたは別アカウント所有のSolveを移行候補へ含めない', async () => {
    solves.set([
      localSolve(),
      localSolve({ id: 'already-owned', ownerType: 'account', ownerId: 'other-account' }),
    ]);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();

    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));
    expect(migration.state().localCount).toBe(1);
    expect(migration.state().targetCount).toBe(1);
    await migration.migrate();

    expect(cloud.put).toHaveBeenCalledTimes(1);
    expect(cloud.put).toHaveBeenCalledWith(account.uid, expect.objectContaining({ id: 'solve-1' }));
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
    expect(solves()[0]).toMatchObject({ ownerType: 'account', ownerId: account.uid });

    cloud.list.mockResolvedValue([{ ...solve, ownerType: 'account', ownerId: account.uid }]);
    migration.retryInspection();
    await vi.waitFor(() => expect(migration.state().phase).toBe('hidden'));
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

    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));
    expect(migration.state().skippedCount).toBe(1);
    await migration.migrate();
    expect(migration.state().phase).toBe('completed');
    expect(cloud.put).not.toHaveBeenCalled();
    expect(assignSolveToAccount).toHaveBeenCalledWith(expect.anything(), account.uid);
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
      processedCount: 2,
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
  it('内容が同じでもローカルのupdatedAtが新しければアップロードする', async () => {
    const solve = localSolve();
    solves.set([solve]);
    cloud.list.mockResolvedValue([
      {
        ...solve,
        updatedAt: '2026-09-01T10:00:00.000Z',
        ownerType: 'account',
        ownerId: account.uid,
      },
    ]);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));

    await migration.migrate();
    expect(cloud.put).toHaveBeenCalledWith(account.uid, solve);
  });

  it('updatedAtが同じなら内容が違っても自動アップロードしない', async () => {
    const solve = localSolve();
    solves.set([solve]);
    cloud.list.mockResolvedValue([
      { ...solve, penalty: '+2', ownerType: 'account', ownerId: account.uid },
    ]);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().phase).toBe('ready'));

    await migration.migrate();
    expect(cloud.put).not.toHaveBeenCalled();
  });
  it('移行前の追加・変更・削除を候補へ即時反映し、開始時点のSolveだけを処理する', async () => {
    const first = localSolve();
    const removed = localSolve({ id: 'removed' });
    solves.set([first, removed]);
    const migration = TestBed.inject(SolveMigrationService);
    user.set(account);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().targetCount).toBe(2));

    const updated = {
      ...first,
      penalty: '+2' as const,
      updatedAt: '2026-09-01T10:02:00.000Z',
    };
    const added = localSolve({ id: 'added' });
    solves.set([updated, added]);
    TestBed.flushEffects();
    await vi.waitFor(() => expect(migration.state().targetCount).toBe(2));

    await migration.migrate();

    expect(cloud.put).toHaveBeenCalledTimes(2);
    expect(cloud.put).toHaveBeenCalledWith(account.uid, updated);
    expect(cloud.put).toHaveBeenCalledWith(account.uid, added);
    expect(cloud.put).not.toHaveBeenCalledWith(
      account.uid,
      expect.objectContaining({ id: 'removed' }),
    );
  });
});
