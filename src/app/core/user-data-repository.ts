import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { AlgorithmPreference, Solve, SolveCategory, RecordGroup } from './cube.models';

/** 現行ユーザーデータのスキーマバージョン。 */
export const USER_DATA_SCHEMA_VERSION = 1;

/** IndexedDBから復元したローカルデータ。 */
export interface StoredUserData {
  /** 新しい順に並んだ計測記録。 */
  readonly solves: Solve[];
  /** 未ログイン時の所有者を表す端末固有UUID。 */
  readonly guestOwnerId: string;
  /** 作成順に並んだユーザー定義グループ。 */
  readonly groups: RecordGroup[];
  /** ケースキーごとのユーザー追加手順とお気に入り。 */
  readonly algorithmPreferences: AlgorithmPreference[];
}

/** 同期対象ユーザーデータの永続化境界。 */
export abstract class UserDataRepository {
  /** @returns 移行を完了したローカルデータ */
  abstract load(): Promise<StoredUserData>;

  /** @param solves 現在の全計測記録 */
  abstract replaceSolves(solves: readonly Solve[]): Promise<void>;

  /** @param groups 現在の全ユーザー定義グループ */
  abstract replaceGroups(groups: readonly RecordGroup[]): Promise<void>;

  /** @param preferences 現在の全ユーザー追加手順とお気に入り */
  abstract replaceAlgorithmPreferences(preferences: readonly AlgorithmPreference[]): Promise<void>;
}

interface CubeRepsDatabase extends DBSchema {
  solves: {
    key: string;
    value: Solve;
    indexes: { date: string; updatedAt: string; ownerId: string };
  };
  groups: { key: string; value: RecordGroup; indexes: { createdAt: string; ownerId: string } };
  algorithmPreferences: {
    key: string;
    value: AlgorithmPreference;
    indexes: { updatedAt: string; ownerId: string };
  };
  metadata: { key: string; value: string | number };
}

/** 旧localStorageデータを移行し、同期対象ユーザーデータをIndexedDBへ保存するRepository。 */
@Injectable()
export class IndexedDbUserDataRepository extends UserDataRepository {
  /** IndexedDBデータベース名。 */
  static readonly databaseName = 'cube-reps';
  /** 旧Solve配列のlocalStorageキー。 */
  static readonly legacyStorageKey = 'cube-reps.solves';
  /** ID付与済み移行データを再試行時にも維持するlocalStorageキー。 */
  static readonly migrationStorageKey = 'cube-reps.solves-migration-v1';
  /** 旧ユーザー定義グループ配列のlocalStorageキー。 */
  static readonly legacyGroupsStorageKey = 'cube-reps.groups';
  /** グループ移行の再試行データを保持するlocalStorageキー。 */
  static readonly migrationGroupsStorageKey = 'cube-reps.groups-migration-v1';
  /** 旧ユーザー手順設定のlocalStorageキー。 */
  static readonly legacyAlgorithmsStorageKey = 'cube-reps.algorithm-preferences';
  /** 手順設定移行の再試行データを保持するlocalStorageキー。 */
  static readonly migrationAlgorithmsStorageKey = 'cube-reps.algorithm-preferences-migration-v1';

  /** 開いたデータベースを共有するPromise。 */
  private readonly database = this.openDatabase();
  /** 複数サービスから同時に要求された初期移行を1回にまとめるPromise。 */
  private loadedData?: Promise<StoredUserData>;

  /** @returns localStorage移行を完了したIndexedDB内のデータ */
  load(): Promise<StoredUserData> {
    this.loadedData ??= this.initialize().catch((error: unknown) => {
      this.loadedData = undefined;
      throw error;
    });
    return this.loadedData;
  }

  /** @returns 3種類のユーザーデータを移行・復元した初期状態 */
  private async initialize(): Promise<StoredUserData> {
    const database = await this.database;
    const guestOwnerId = await this.loadGuestOwnerId(database);
    await Promise.all([
      this.migrateLegacySolves(database, guestOwnerId),
      this.migrateLegacyGroups(database, guestOwnerId),
      this.migrateLegacyAlgorithmPreferences(database, guestOwnerId),
    ]);
    const solves = await database.getAllFromIndex('solves', 'date');
    const groups = await database.getAllFromIndex('groups', 'createdAt');
    const algorithmPreferences = await database.getAll('algorithmPreferences');
    return {
      solves: solves.sort((left, right) => right.date.localeCompare(left.date)),
      guestOwnerId,
      groups,
      algorithmPreferences,
    };
  }
  /** 現在の全Solveを1トランザクションで置き換える。 */
  async replaceSolves(solves: readonly Solve[]): Promise<void> {
    const database = await this.database;
    const transaction = database.transaction('solves', 'readwrite');
    await transaction.store.clear();
    await Promise.all(solves.map((solve) => transaction.store.put(solve)));
    await transaction.done;
  }

  /** 現在の全ユーザー定義グループを1トランザクションで置き換える。 */
  async replaceGroups(groups: readonly RecordGroup[]): Promise<void> {
    const database = await this.database;
    const transaction = database.transaction('groups', 'readwrite');
    await transaction.store.clear();
    await Promise.all(groups.map((group) => transaction.store.put(group)));
    await transaction.done;
  }

  /** 現在の全ユーザー手順設定を1トランザクションで置き換える。 */
  async replaceAlgorithmPreferences(preferences: readonly AlgorithmPreference[]): Promise<void> {
    const database = await this.database;
    const transaction = database.transaction('algorithmPreferences', 'readwrite');
    await transaction.store.clear();
    await Promise.all(preferences.map((preference) => transaction.store.put(preference)));
    await transaction.done;
  }
  /** @returns 必要なストアと検索インデックスを持つデータベース */
  private openDatabase(): Promise<IDBPDatabase<CubeRepsDatabase>> {
    return openDB<CubeRepsDatabase>(IndexedDbUserDataRepository.databaseName, 2, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          const solves = database.createObjectStore('solves', { keyPath: 'id' });
          solves.createIndex('date', 'date');
          solves.createIndex('updatedAt', 'updatedAt');
          solves.createIndex('ownerId', 'ownerId');
          database.createObjectStore('metadata');
        }
        if (oldVersion < 2) {
          const groups = database.createObjectStore('groups', { keyPath: 'id' });
          groups.createIndex('createdAt', 'createdAt');
          groups.createIndex('ownerId', 'ownerId');
          const preferences = database.createObjectStore('algorithmPreferences', {
            keyPath: 'caseKey',
          });
          preferences.createIndex('updatedAt', 'updatedAt');
          preferences.createIndex('ownerId', 'ownerId');
        }
      },
    });
  }

  /** @returns IndexedDBに永続化したゲスト所有者UUID */
  private async loadGuestOwnerId(database: IDBPDatabase<CubeRepsDatabase>): Promise<string> {
    const stored = await database.get('metadata', 'guestOwnerId');
    if (typeof stored === 'string' && stored) return stored;
    const guestOwnerId = crypto.randomUUID();
    await database.put('metadata', guestOwnerId, 'guestOwnerId');
    return guestOwnerId;
  }

  /** localStorageの旧Solveを、再試行可能かつ重複しない形で移行する。 */
  private async migrateLegacySolves(
    database: IDBPDatabase<CubeRepsDatabase>,
    guestOwnerId: string,
  ): Promise<void> {
    const staged = this.readLegacyArray(IndexedDbUserDataRepository.migrationStorageKey);
    const legacy = staged ?? this.readLegacyArray(IndexedDbUserDataRepository.legacyStorageKey);
    if (!legacy) return;

    const normalized = legacy.flatMap((value) => {
      const solve = this.normalizeLegacySolve(value, guestOwnerId);
      return solve ? [solve] : [];
    });
    if (!staged) {
      localStorage.setItem(
        IndexedDbUserDataRepository.migrationStorageKey,
        JSON.stringify(normalized),
      );
    }

    const transaction = database.transaction(['solves', 'metadata'], 'readwrite');
    await Promise.all(normalized.map((solve) => transaction.objectStore('solves').put(solve)));
    await transaction.objectStore('metadata').put(USER_DATA_SCHEMA_VERSION, 'solveSchemaVersion');
    await transaction.done;
    localStorage.removeItem(IndexedDbUserDataRepository.legacyStorageKey);
    localStorage.removeItem(IndexedDbUserDataRepository.migrationStorageKey);
  }

  /** localStorageの旧グループを同期可能な形式へ移行する。 */
  private async migrateLegacyGroups(
    database: IDBPDatabase<CubeRepsDatabase>,
    guestOwnerId: string,
  ): Promise<void> {
    const staged = this.readLegacyArray(IndexedDbUserDataRepository.migrationGroupsStorageKey);
    const legacy =
      staged ?? this.readLegacyArray(IndexedDbUserDataRepository.legacyGroupsStorageKey);
    if (!legacy) return;
    const normalized = legacy.flatMap((value) => {
      const group = this.normalizeLegacyGroup(value, guestOwnerId);
      return group ? [group] : [];
    });
    if (!staged) {
      localStorage.setItem(
        IndexedDbUserDataRepository.migrationGroupsStorageKey,
        JSON.stringify(normalized),
      );
    }
    const transaction = database.transaction(['groups', 'metadata'], 'readwrite');
    await Promise.all(normalized.map((group) => transaction.objectStore('groups').put(group)));
    await transaction.objectStore('metadata').put(USER_DATA_SCHEMA_VERSION, 'groupSchemaVersion');
    await transaction.done;
    localStorage.removeItem(IndexedDbUserDataRepository.legacyGroupsStorageKey);
    localStorage.removeItem(IndexedDbUserDataRepository.migrationGroupsStorageKey);
  }

  /** localStorageの旧ユーザー手順設定をケース単位のレコードへ移行する。 */
  private async migrateLegacyAlgorithmPreferences(
    database: IDBPDatabase<CubeRepsDatabase>,
    guestOwnerId: string,
  ): Promise<void> {
    const staged = this.readLegacyArray(IndexedDbUserDataRepository.migrationAlgorithmsStorageKey);
    const legacy = this.readLegacyObject(IndexedDbUserDataRepository.legacyAlgorithmsStorageKey);
    if (!staged && !legacy) return;
    const normalized =
      staged?.flatMap((value) => {
        const preference = this.normalizeLegacyAlgorithmPreference(value, guestOwnerId);
        return preference ? [preference] : [];
      }) ??
      Object.entries(legacy ?? {}).flatMap(([caseKey, value]) => {
        const preference = this.normalizeLegacyAlgorithmPreference(
          { ...(value as object), caseKey },
          guestOwnerId,
        );
        return preference ? [preference] : [];
      });
    if (!staged) {
      localStorage.setItem(
        IndexedDbUserDataRepository.migrationAlgorithmsStorageKey,
        JSON.stringify(normalized),
      );
    }
    const transaction = database.transaction(['algorithmPreferences', 'metadata'], 'readwrite');
    await Promise.all(
      normalized.map((preference) =>
        transaction.objectStore('algorithmPreferences').put(preference),
      ),
    );
    await transaction
      .objectStore('metadata')
      .put(USER_DATA_SCHEMA_VERSION, 'algorithmSchemaVersion');
    await transaction.done;
    localStorage.removeItem(IndexedDbUserDataRepository.legacyAlgorithmsStorageKey);
    localStorage.removeItem(IndexedDbUserDataRepository.migrationAlgorithmsStorageKey);
  }

  private readLegacyArray(key: string): unknown[] | undefined {
    const stored = localStorage.getItem(key);
    if (stored === null) return undefined;
    try {
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  /** @returns JSONオブジェクトとして読める場合の旧データ */
  private readLegacyObject(key: string): Record<string, unknown> | undefined {
    const stored = localStorage.getItem(key);
    if (stored === null) return undefined;
    try {
      const parsed: unknown = JSON.parse(stored);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : undefined;
    } catch {
      return undefined;
    }
  }

  /** @returns 必須項目を検証して同期可能な形式へ変換したグループ */
  private normalizeLegacyGroup(value: unknown, guestOwnerId: string): RecordGroup | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const group = value as Partial<RecordGroup>;
    if (typeof group.name !== 'string' || typeof group.createdAt !== 'string') return undefined;
    return {
      id: typeof group.id === 'string' && group.id ? group.id : crypto.randomUUID(),
      name: group.name,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt ?? group.createdAt,
      ownerType: group.ownerType ?? 'guest',
      ownerId: group.ownerId ?? guestOwnerId,
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
  }

  /** @returns ユーザー手順IDとお気に入り参照を同期可能な形式へ変換した設定 */
  private normalizeLegacyAlgorithmPreference(
    value: unknown,
    guestOwnerId: string,
  ): AlgorithmPreference | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const preference = value as Partial<AlgorithmPreference>;
    if (typeof preference.caseKey !== 'string' || !Array.isArray(preference.custom))
      return undefined;
    const idMap = new Map<string, string>();
    const custom = preference.custom.flatMap((algorithm) => {
      if (!algorithm || typeof algorithm.notation !== 'string') return [];
      const oldId = typeof algorithm.id === 'string' ? algorithm.id : '';
      const id = this.isUuid(oldId) ? oldId : crypto.randomUUID();
      if (oldId) idMap.set(oldId, id);
      return [{ id, notation: algorithm.notation, builtIn: false }];
    });
    return {
      caseKey: preference.caseKey,
      custom,
      favoriteId: preference.favoriteId
        ? (idMap.get(preference.favoriteId) ?? preference.favoriteId)
        : undefined,
      updatedAt: preference.updatedAt ?? new Date().toISOString(),
      ownerType: preference.ownerType ?? 'guest',
      ownerId: preference.ownerId ?? guestOwnerId,
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
  }

  /** @returns 値がUUIDなら`true` */
  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  /** @returns 必須項目を検証して現行形式へ変換したSolve */
  private normalizeLegacySolve(value: unknown, guestOwnerId: string): Solve | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const solve = value as Partial<Solve>;
    if (
      typeof solve.time !== 'number' ||
      typeof solve.scramble !== 'string' ||
      typeof solve.date !== 'string' ||
      !this.isCategory(solve.category)
    ) {
      return undefined;
    }
    return {
      id: typeof solve.id === 'string' && solve.id ? solve.id : crypto.randomUUID(),
      time: solve.time,
      scramble: solve.scramble,
      date: solve.date,
      updatedAt: solve.updatedAt ?? solve.date,
      ownerType: solve.ownerType ?? 'guest',
      ownerId: solve.ownerId ?? guestOwnerId,
      schemaVersion: USER_DATA_SCHEMA_VERSION,
      category: solve.category,
      caseName: solve.caseName,
      groupId: solve.groupId || 'unclassified',
      penalty: solve.penalty ?? 'none',
    };
  }

  /** @returns 値が対応済みsolveカテゴリーなら`true` */
  private isCategory(value: unknown): value is SolveCategory {
    return value === 'full' || value === 'oll' || value === 'pll';
  }
}
