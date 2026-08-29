import 'fake-indexeddb/auto';
import { deleteDB } from 'idb';
import { IndexedDbUserDataRepository, USER_DATA_SCHEMA_VERSION } from './user-data-repository';

describe('IndexedDbUserDataRepository', () => {
  it('旧localStorageの同期対象データを現行形式へ移行し、以後はIndexedDBだけから復元する', async () => {
    await deleteDB(IndexedDbUserDataRepository.databaseName);
    localStorage.clear();
    localStorage.setItem(
      IndexedDbUserDataRepository.legacyStorageKey,
      JSON.stringify([
        {
          time: 1234,
          scramble: 'R U',
          date: '2026-01-01T00:00:00.000Z',
          category: 'full',
          penalty: 'none',
        },
        {
          id: 'existing-id',
          time: 2345,
          scramble: 'U R',
          date: '2026-01-02T00:00:00.000Z',
          category: 'pll',
          caseName: 'T',
          penalty: '+2',
        },
      ]),
    );
    localStorage.setItem(
      IndexedDbUserDataRepository.legacyGroupsStorageKey,
      JSON.stringify([
        {
          id: 'group-id',
          name: 'Competition',
          createdAt: '2026-01-03T00:00:00.000Z',
        },
      ]),
    );
    localStorage.setItem(
      IndexedDbUserDataRepository.legacyAlgorithmsStorageKey,
      JSON.stringify({
        'PLL-Aa': {
          custom: [{ id: 'user-123', notation: 'R U', builtIn: false }],
          favoriteId: 'user-123',
        },
      }),
    );

    const firstRepository = new IndexedDbUserDataRepository();
    const originalPut = IDBObjectStore.prototype.put;
    const putSpy = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (
      this: IDBObjectStore,
      value: unknown,
      key?: IDBValidKey,
    ) {
      if (value && typeof value === 'object' && 'time' in value) {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      }
      return key === undefined ? originalPut.call(this, value) : originalPut.call(this, value, key);
    });

    await expect(firstRepository.load()).rejects.toThrow('quota exceeded');
    const staged = JSON.parse(
      localStorage.getItem(IndexedDbUserDataRepository.migrationStorageKey) ?? '[]',
    ) as Array<{ id: string }>;
    expect(localStorage.getItem(IndexedDbUserDataRepository.legacyStorageKey)).not.toBeNull();
    putSpy.mockRestore();
    const migrated = await firstRepository.load();

    expect(migrated.solves).toHaveLength(2);
    expect(migrated.solves[0].id).toBe('existing-id');
    expect(migrated.solves[1]).toMatchObject({
      updatedAt: '2026-01-01T00:00:00.000Z',
      ownerType: 'guest',
      ownerId: migrated.guestOwnerId,
      schemaVersion: USER_DATA_SCHEMA_VERSION,
      groupId: 'unclassified',
    });
    expect(migrated.solves[1].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(migrated.solves[1].id).toBe(staged[0].id);
    expect(localStorage.getItem(IndexedDbUserDataRepository.legacyStorageKey)).toBeNull();
    expect(localStorage.getItem(IndexedDbUserDataRepository.migrationStorageKey)).toBeNull();
    expect(migrated.groups).toEqual([
      expect.objectContaining({
        id: 'group-id',
        name: 'Competition',
        updatedAt: '2026-01-03T00:00:00.000Z',
        ownerId: migrated.guestOwnerId,
        schemaVersion: USER_DATA_SCHEMA_VERSION,
      }),
    ]);
    expect(migrated.algorithmPreferences).toHaveLength(1);
    const preference = migrated.algorithmPreferences[0];
    expect(preference).toMatchObject({
      caseKey: 'PLL-Aa',
      ownerId: migrated.guestOwnerId,
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    });
    expect(preference.custom[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(preference.favoriteId).toBe(preference.custom[0].id);
    expect(localStorage.getItem(IndexedDbUserDataRepository.legacyGroupsStorageKey)).toBeNull();
    expect(localStorage.getItem(IndexedDbUserDataRepository.legacyAlgorithmsStorageKey)).toBeNull();

    const updated = { ...migrated.solves[0], penalty: 'DNF' as const };
    const addedGroup = { ...migrated.groups[0], id: 'other-group', name: 'Other' };
    const addedPreference = { ...preference, caseKey: 'OLL-01' };
    await Promise.all([
      firstRepository.putSolve(updated),
      firstRepository.putRecordGroup(addedGroup),
      firstRepository.putAlgorithmPreference(addedPreference),
    ]);
    const secondRepository = new IndexedDbUserDataRepository();
    const restored = await secondRepository.load();

    expect(restored.guestOwnerId).toBe(migrated.guestOwnerId);
    expect(restored.solves).toEqual([updated, migrated.solves[1]]);
    expect(restored.groups).toEqual(expect.arrayContaining([...migrated.groups, addedGroup]));
    expect(restored.algorithmPreferences).toEqual(
      expect.arrayContaining([...migrated.algorithmPreferences, addedPreference]),
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

    expect(finalData.solves).toEqual([migrated.solves[1]]);
    expect(finalData.groups).toEqual(migrated.groups);
    expect(finalData.algorithmPreferences).toEqual(migrated.algorithmPreferences);
  });
});
