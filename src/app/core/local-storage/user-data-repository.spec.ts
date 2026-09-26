import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { IndexedDbUserDataRepository, USER_DATA_SCHEMA_VERSION } from './user-data-repository';

describe('IndexedDbUserDataRepository', () => {
  beforeEach(() => {
    vi.stubGlobal('indexedDB', new IDBFactory());
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());
  it('F2Lのケース・スロットと既存カテゴリーを再起動後にも保持する', async () => {
    const repository = new IndexedDbUserDataRepository();
    const metadata = {
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ownerType: 'guest' as const,
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    for (const category of ['full', 'oll', 'pll', 'f2l'] as const) {
      await repository.putSolve({
        ...metadata,
        id: category,
        category,
        time: 1000,
        scramble: 'R U',
        penalty: 'none',
        ...(category === 'f2l'
          ? { caseName: '01', caseId: 'F2L-01', f2lSlot: 'BL' as const }
          : category === 'full'
            ? {}
            : { caseId: category === 'oll' ? 'OLL-01' : 'PLL-T' }),
      });
    }
    const restored = await new IndexedDbUserDataRepository().load();
    expect(restored.solves).toHaveLength(4);
    expect(restored.solves.find((solve) => solve.category === 'oll')?.caseId).toBe('OLL-01');
    expect(restored.solves.find((solve) => solve.category === 'pll')?.caseId).toBe('PLL-T');
    expect(restored.solves.find((solve) => solve.category === 'f2l')).toMatchObject({
      caseName: '01',
      caseId: 'F2L-01',
      f2lSlot: 'BL',
    });
  });

  it('IndexedDBの記録・グループ・手順設定を復元し、更新・削除を永続化する', async () => {
    const metadata = {
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ownerType: 'guest' as const,
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    const firstRepository = new IndexedDbUserDataRepository();
    const solve = {
      ...metadata,
      id: 'solve-1',
      time: 1234,
      scramble: 'R U',
      category: 'full' as const,
      penalty: 'none' as const,
      groupId: 'group-id',
    };
    const group = { ...metadata, id: 'group-id', name: 'Competition' };
    const preference = {
      ...metadata,
      caseKey: 'PLL-Aa',
      custom: [{ id: 'custom-id', notation: 'R U', builtIn: false }],
      favoriteId: 'custom-id',
    };
    await firstRepository.putSolve(solve);
    await firstRepository.putSolve({
      ...solve,
      id: 'solve-2',
      createdAt: '2026-01-02T00:00:00.000Z',
    });
    await firstRepository.putRecordGroup(group);
    await firstRepository.putAlgorithmPreference(preference);
    const stored = await firstRepository.load();
    expect(stored.solves.map((record) => record.id)).toEqual(['solve-2', 'solve-1']);
    expect(stored.groups).toEqual([group]);
    expect(stored.algorithmPreferences).toEqual([preference]);
    const updated = { ...stored.solves[0], penalty: 'DNF' as const };
    const updatedGroup = { ...group, name: 'Updated competition' };
    const updatedPreference = { ...preference, favoriteId: 'builtin-1' };
    const addedGroup = { ...stored.groups[0], id: 'other-group', name: 'Other' };
    const addedPreference = { ...preference, caseKey: 'OLL-01' };
    await Promise.all([
      firstRepository.putSolve(updated),
      firstRepository.putRecordGroup(updatedGroup),
      firstRepository.putAlgorithmPreference(updatedPreference),
      firstRepository.putRecordGroup(addedGroup),
      firstRepository.putAlgorithmPreference(addedPreference),
    ]);
    const secondRepository = new IndexedDbUserDataRepository();
    const restored = await secondRepository.load();

    expect(restored.accounts).toEqual([]);
    expect(restored.solves).toEqual([updated, stored.solves[1]]);
    expect(restored.groups).toEqual(expect.arrayContaining([updatedGroup, addedGroup]));
    expect(restored.algorithmPreferences).toEqual(
      expect.arrayContaining([updatedPreference, addedPreference]),
    );

    const latest = { ...updated, penalty: 'none' as const };
    await Promise.all([
      secondRepository.putSolve(latest),
      secondRepository.deleteSolve(latest.id),
      secondRepository.deleteRecordGroup(addedGroup.id),
      secondRepository.deleteAlgorithmPreference(addedPreference.caseKey),
    ]);
    const finalRepository = new IndexedDbUserDataRepository();
    const finalData = await finalRepository.load();

    expect(finalData.solves).toEqual([stored.solves[1]]);
    expect(finalData.groups).toEqual([updatedGroup]);
    expect(finalData.algorithmPreferences).toEqual([updatedPreference]);
  });
  it('旧キーとステージングが残っていてもlocalStorageにアクセスしない', async () => {
    for (const key of ['solves', 'groups', 'algorithm-preferences']) {
      localStorage.setItem('cube-reps.' + key, '[{"id":"legacy"}]');
      localStorage.setItem('cube-reps.' + key + '-migration-v1', '[{"id":"staged"}]');
    }
    localStorage.setItem('cube-reps.active-group', 'competition');
    localStorage.setItem('cube-reps.language', 'en');
    const get = vi.spyOn(Storage.prototype, 'getItem');
    const set = vi.spyOn(Storage.prototype, 'setItem');
    const remove = vi.spyOn(Storage.prototype, 'removeItem');
    try {
      const repository = new IndexedDbUserDataRepository();
      await expect(repository.load()).resolves.toEqual({
        solves: [],
        groups: [],
        algorithmPreferences: [],
        accounts: [],
      });
      expect(get).not.toHaveBeenCalled();
      expect(set).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    } finally {
      get.mockRestore();
      set.mockRestore();
      remove.mockRestore();
    }
    expect(localStorage.getItem('cube-reps.active-group')).toBe('competition');
    expect(localStorage.getItem('cube-reps.language')).toBe('en');
  });
  it('v2の異なるゲストIDを除去し、記録・グループ・お気に入りの参照とアカウント所有を維持する', async () => {
    const old = await openDB(IndexedDbUserDataRepository.databaseName, 2, {
      upgrade(db) {
        const solves = db.createObjectStore('solves', { keyPath: 'id' });
        solves.createIndex('date', 'date');
        solves.createIndex('updatedAt', 'updatedAt');
        solves.createIndex('ownerId', 'ownerId');
        const groups = db.createObjectStore('groups', { keyPath: 'id' });
        groups.createIndex('createdAt', 'createdAt');
        groups.createIndex('ownerId', 'ownerId');
        const preferences = db.createObjectStore('algorithmPreferences', { keyPath: 'caseKey' });
        preferences.createIndex('updatedAt', 'updatedAt');
        preferences.createIndex('ownerId', 'ownerId');
        db.createObjectStore('metadata');
      },
    });
    const metadata = {
      updatedAt: '2026-01-01T00:00:00.000Z',
      ownerType: 'guest',
      schemaVersion: 1,
    };
    for (const [index, ownerId] of ['guest-a', 'guest-b'].entries()) {
      await old.put('groups', {
        ...metadata,
        id: `group-${index}`,
        name: 'Same name',
        createdAt: metadata.updatedAt,
        ownerId,
      });
      await old.put('solves', {
        ...metadata,
        id: `solve-${index}`,
        time: 1234,
        date: metadata.updatedAt,
        scramble: 'R',
        category: 'full',
        penalty: 'none',
        groupId: `group-${index}`,
        ownerId,
      });
    }
    await old.put('algorithmPreferences', {
      ...metadata,
      ownerId: 'guest-a',
      caseKey: 'PLL-T',
      custom: [{ id: 'custom-id', notation: 'R' }],
      favoriteId: 'custom-id',
    });
    await old.put('solves', {
      ...metadata,
      id: 'account-solve',
      date: metadata.updatedAt,
      ownerType: 'account',
      ownerId: 'account-a',
      deletedAt: metadata.updatedAt,
    });
    await old.put('metadata', 'guest-b', 'guestOwnerId');
    old.close();
    const repository = new IndexedDbUserDataRepository();
    const data = await repository.load();
    expect(
      data.solves
        .filter((solve) => solve.ownerType === 'guest')
        .map((solve) => [solve.id, solve.groupId, solve.ownerId]),
    ).toEqual([
      ['solve-0', 'group-0', undefined],
      ['solve-1', 'group-1', undefined],
    ]);
    expect(data.groups.map((group) => [group.id, group.ownerId])).toEqual([
      ['group-0', undefined],
      ['group-1', undefined],
    ]);
    expect(data.algorithmPreferences[0]).toMatchObject({
      favoriteId: 'custom-id',
      custom: [{ id: 'custom-id' }],
    });
    expect(data.algorithmPreferences[0]).not.toHaveProperty('ownerId');
    expect(data.solves.find((solve) => solve.id === 'account-solve')).toMatchObject({
      ownerId: 'account-a',
      deletedAt: metadata.updatedAt,
    });
    const database = await openDB(IndexedDbUserDataRepository.databaseName);
    expect(await database.get('metadata', 'guestOwnerId')).toBeUndefined();
    await repository.putAccount({
      uid: 'account-a',
      displayName: 'Name',
      providerIds: ['apple.com'],
      ...{ accessToken: 'must-not-save' },
    });
    expect(await database.get('accounts', 'account-a')).not.toHaveProperty('accessToken');
    expect((await new IndexedDbUserDataRepository().load()).solves).toEqual(data.solves);
    database.close();
  });
  it('v3のdateをcreatedAt索引へ移行し、新旧記録を再読み込みできる', async () => {
    const old = await openDB(IndexedDbUserDataRepository.databaseName, 3, {
      upgrade(db) {
        const solves = db.createObjectStore('solves', { keyPath: 'id' });
        solves.createIndex('date', 'date');
        solves.createIndex('updatedAt', 'updatedAt');
        solves.createIndex('ownerId', 'ownerId');
        const groups = db.createObjectStore('groups', { keyPath: 'id' });
        groups.createIndex('createdAt', 'createdAt');
        groups.createIndex('ownerId', 'ownerId');
        const preferences = db.createObjectStore('algorithmPreferences', { keyPath: 'caseKey' });
        preferences.createIndex('updatedAt', 'updatedAt');
        preferences.createIndex('ownerId', 'ownerId');
        db.createObjectStore('accounts', { keyPath: 'uid' });
        db.createObjectStore('metadata');
      },
    });
    const date = '2026-01-01T00:00:00.000Z';
    await old.put('solves', {
      id: 'legacy',
      time: 1000,
      scramble: 'R',
      date,
      updatedAt: date,
      ownerType: 'account',
      ownerId: 'account',
      pendingSync: true,
      deletedAt: date,
      category: 'full',
      penalty: 'none',
      schemaVersion: 2,
    });
    old.close();
    const repository = new IndexedDbUserDataRepository();
    const data = await repository.load();
    expect(data.solves).toHaveLength(1);
    expect(data.solves[0]).toMatchObject({
      id: 'legacy',
      createdAt: date,
      ownerId: 'account',
      pendingSync: true,
      deletedAt: date,
    });
    expect(data.solves[0]).not.toHaveProperty('date');
    const fresh = { ...data.solves[0], id: 'fresh', createdAt: '2026-01-02T00:00:00.000Z' };
    await repository.putSolve(fresh);
    const restored = await new IndexedDbUserDataRepository().load();
    expect(restored.solves.map((solve) => solve.id)).toEqual(['fresh', 'legacy']);
  });
});
