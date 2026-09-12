import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { CubeService } from '../cube';
import { GroupMutation } from '../cube.models';
import { FirestoreSyncService } from './firestore-sync.service';
import { RecordGroup } from '../cube.models';
import { SystemStore } from '../system.store';
import { FirestoreGroupRepository } from './firestore-group.repository';
import { GroupSyncService } from './group-sync.service';

describe('GroupSyncService', () => {
  const account = {
    uid: 'account-1',
    displayName: 'Cube User',
    email: 'cube@example.com',
    photoURL: null,
  };
  const group: RecordGroup = {
    id: '4d651998-42f1-4e63-9815-7f56bcac524d',
    name: 'Practice',
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-03T10:00:00.000Z',
    ownerType: 'account',
    ownerId: account.uid,
    schemaVersion: 1,
  };
  let auth: { user: ReturnType<typeof signal<typeof account | null>> };
  let cube: {
    ready: Promise<void>;
    groupSyncFinished: ReturnType<typeof vi.fn>;
    mergeGroups: ReturnType<typeof vi.fn>;
  };
  let queue: { groupMutations: ReturnType<typeof signal<readonly GroupMutation[]>> };
  let cloud: {
    list: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    tombstone: ReturnType<typeof vi.fn>;
  };
  let system: { online: ReturnType<typeof signal<boolean>> };

  beforeEach(() => {
    auth = { user: signal<typeof account | null>(null) };
    queue = { groupMutations: signal<readonly GroupMutation[]>([]) };
    cube = {
      ready: Promise.resolve(),
      groupSyncFinished: vi.fn(async () => undefined),
      mergeGroups: vi.fn(async () => undefined),
    };
    cloud = {
      list: vi.fn(async () => [group]),
      put: vi.fn(async () => undefined),
      tombstone: vi.fn(async () => undefined),
    };
    system = { online: signal(true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CubeService, useValue: cube },
        { provide: FirestoreSyncService, useValue: queue },
        { provide: FirestoreGroupRepository, useValue: cloud },
        { provide: SystemStore, useValue: system },
      ],
    });
  });

  it('取得要求でアカウントのグループを取得してローカルへ統合する', async () => {
    const sync = TestBed.inject(GroupSyncService);
    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();

    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledWith(account.uid));
    expect(cube.mergeGroups).toHaveBeenCalledWith([group]);
    expect(sync.phase()).toBe('synced');
  });

  it('明示的な更新でアカウントのグループを再取得する', async () => {
    const sync = TestBed.inject(GroupSyncService);
    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(1));

    sync.refresh();

    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(2));
  });

  it('オフライン移行を表示へ反映し、オンライン復帰後の取得要求で再取得する', async () => {
    const sync = TestBed.inject(GroupSyncService);
    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(1));

    system.online.set(false);
    TestBed.tick();
    expect(cloud.list).toHaveBeenCalledTimes(1);
    expect(sync.phase()).toBe('offline');

    system.online.set(true);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(2));
    expect(sync.phase()).toBe('synced');
  });

  it('取得要求の結果を反映してもオフライン状態は維持する', async () => {
    system.online.set(false);
    const sync = TestBed.inject(GroupSyncService);

    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();

    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledWith(account.uid));
    expect(cube.mergeGroups).toHaveBeenCalledWith([group]);
    expect(sync.phase()).toBe('offline');
  });

  it('追加・更新と削除を別のFirestore操作へ転送する', async () => {
    TestBed.inject(GroupSyncService);
    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();

    queue.groupMutations.set([{ kind: 'put', data: group }]);
    TestBed.tick();
    await vi.waitFor(() => expect(cloud.put).toHaveBeenCalledWith(account.uid, group));

    queue.groupMutations.set([{ kind: 'delete', data: { ...group, deletedAt: group.updatedAt } }]);
    TestBed.tick();
    await vi.waitFor(() =>
      expect(cloud.tombstone).toHaveBeenCalledWith(
        account.uid,
        expect.objectContaining({ id: group.id }),
      ),
    );
  });
  it('ログアウト中や別アカウントのキューではFirestoreへアクセスしない', async () => {
    TestBed.inject(GroupSyncService);
    queue.groupMutations.set([{ kind: 'put', data: group }]);
    TestBed.tick();
    expect(cloud.list).not.toHaveBeenCalled();
    expect(cloud.put).not.toHaveBeenCalled();
    auth.user.set({ ...account, uid: 'other' });
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledWith('other'));
    expect(cloud.put).not.toHaveBeenCalled();
    expect(queue.groupMutations()).toHaveLength(1);
  });

  it('一括移行の一部失敗を別記録の成功で隠さず、失敗分だけ再試行する', async () => {
    const sync = TestBed.inject(GroupSyncService);
    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    cloud.put.mockRejectedValueOnce(new Error('offline'));
    queue.groupMutations.set([
      { kind: 'put', data: group },
      { kind: 'put', data: { ...group, id: 'second' } },
    ]);
    TestBed.tick();
    await vi.waitFor(() => expect(sync.phase()).toBe('error'));
    expect(cloud.put).toHaveBeenCalledTimes(2);
    sync.retry();
    await vi.waitFor(() => expect(sync.phase()).toBe('synced'));
    expect(cloud.put).toHaveBeenCalledTimes(3);
    expect(cloud.put.mock.calls[2][1].id).toBe(group.id);
  });
  it('取得中にアカウントが切り替わった場合、古い取得結果を取り込まない', async () => {
    let complete!: (records: (typeof group)[]) => void;
    cloud.list.mockReturnValueOnce(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    TestBed.inject(GroupSyncService);
    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();
    await vi.waitFor(() => expect(cloud.list).toHaveBeenCalledTimes(1));
    auth.user.set(null);
    TestBed.tick();
    complete([group]);
    await Promise.resolve();
    expect(cube.mergeGroups).not.toHaveBeenCalled();
  });

  it('取得結果のうちログイン先以外の所有者を取り込まない', async () => {
    cloud.list.mockResolvedValueOnce([group, { ...group, id: 'other', ownerId: 'other' }]);
    TestBed.inject(GroupSyncService);
    auth.user.set(account);
    TestBed.tick();
    void TestBed.inject(GroupSyncService).refresh();
    await vi.waitFor(() => expect(cube.mergeGroups).toHaveBeenCalledWith([group]));
  });
});
