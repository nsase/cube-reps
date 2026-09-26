import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { LocalAccount } from '../account.models';
import { AlgorithmPreference, RecordGroup, Solve } from '../cube/cube.models';

/** 現行ユーザーデータのスキーマバージョン。 */
export const USER_DATA_SCHEMA_VERSION = 3;

/** IndexedDBから復元したローカルデータ。 */
export interface StoredUserData {
  /** 新しい順に並んだ計測記録。 */
  readonly solves: Solve[];
  /** このブラウザで利用したアカウントの表示台帳。 */
  readonly accounts: LocalAccount[];
  /** 作成順に並んだユーザー定義グループ。 */
  readonly groups: RecordGroup[];
  /** ケースキーごとのユーザー追加手順とお気に入り。 */
  readonly algorithmPreferences: AlgorithmPreference[];
}

/** 同期対象ユーザーデータの永続化境界。 */
export abstract class UserDataRepository {
  /** ローカルに保存済みのユーザーデータを復元する。 */
  abstract load(): Promise<StoredUserData>;

  /** アカウントの表示情報だけをUID単位で保存する。 */
  abstract putAccount(account: LocalAccount): Promise<void>;

  /** @param solve 追加または更新する計測記録 */
  abstract putSolve(solve: Solve): Promise<void>;

  /** @param id 削除する計測記録ID */
  abstract deleteSolve(id: string): Promise<void>;

  /** @param group 追加または更新するユーザー定義グループ */
  abstract putRecordGroup(group: RecordGroup): Promise<void>;

  /** @param id 削除するユーザー定義グループID */
  abstract deleteRecordGroup(id: string): Promise<void>;

  /** @param preference 追加または更新するユーザー手順設定 */
  abstract putAlgorithmPreference(preference: AlgorithmPreference): Promise<void>;

  /** @param caseKey 削除するユーザー手順設定のケースキー */
  abstract deleteAlgorithmPreference(caseKey: string): Promise<void>;
}

interface CubeRepsDatabase extends DBSchema {
  solves: {
    key: string;
    value: Solve;
    indexes: { createdAt: string; updatedAt: string; ownerId: string };
  };
  groups: { key: string; value: RecordGroup; indexes: { createdAt: string; ownerId: string } };
  algorithmPreferences: {
    key: string;
    value: AlgorithmPreference;
    indexes: { updatedAt: string; ownerId: string };
  };
  accounts: { key: string; value: LocalAccount };
  metadata: { key: string; value: string | number };
}

/** 同期対象ユーザーデータをIndexedDBへ保存・復元するRepository。 */
@Injectable()
export class IndexedDbUserDataRepository extends UserDataRepository {
  /** IndexedDBデータベース名。 */
  static readonly databaseName = 'cube-reps';
  /** 開いたデータベースを共有するPromise。 */
  private readonly database = this.openDatabase();
  /** 複数サービスから同時に要求された初期読み込みを1回にまとめるPromise。 */
  private loadedData?: Promise<StoredUserData>;
  /** 通常操作の実行順を維持し、古い書き込みによるデータ復活を防ぐキュー。 */
  private writeQueue: Promise<void> = Promise.resolve();

  /** IndexedDB内のユーザーデータを復元する。 */
  load(): Promise<StoredUserData> {
    this.loadedData ??= this.initialize().catch((error: unknown) => {
      this.loadedData = undefined;
      throw error;
    });
    return this.loadedData;
  }

  /** ユーザーデータとアカウント表示台帳をIndexedDBから読み込む。 */
  private async initialize(): Promise<StoredUserData> {
    const database = await this.database;
    const solves = await database.getAllFromIndex('solves', 'createdAt');
    const groups = await database.getAllFromIndex('groups', 'createdAt');
    const algorithmPreferences = await database.getAll('algorithmPreferences');
    return {
      solves: solves.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
      accounts: await database.getAll('accounts'),
      groups,
      algorithmPreferences,
    };
  }
  /** 認証情報を混入させず、最新のアカウント表示情報を保存する。 */
  putAccount(account: LocalAccount): Promise<void> {
    const { uid, displayName, email, photoURL, providerIds } = account;
    return this.enqueueWrite(async (database) => {
      await database.put('accounts', { uid, displayName, email, photoURL, providerIds });
    });
  }

  /** 記録を既存データへ影響させず追加または更新する。 */
  putSolve(solve: Solve): Promise<void> {
    return this.enqueueWrite(async (database) => {
      await database.put('solves', solve);
    });
  }

  /** 指定IDの記録だけを削除する。 */
  deleteSolve(id: string): Promise<void> {
    return this.enqueueWrite(async (database) => {
      await database.delete('solves', id);
    });
  }

  /** グループを既存データへ影響させず追加または更新する。 */
  putRecordGroup(group: RecordGroup): Promise<void> {
    return this.enqueueWrite(async (database) => {
      await database.put('groups', group);
    });
  }

  /** 指定IDのグループだけを削除する。 */
  deleteRecordGroup(id: string): Promise<void> {
    return this.enqueueWrite(async (database) => {
      await database.delete('groups', id);
    });
  }

  /** ケース設定を既存データへ影響させず追加または更新する。 */
  putAlgorithmPreference(preference: AlgorithmPreference): Promise<void> {
    return this.enqueueWrite(async (database) => {
      await database.put('algorithmPreferences', preference);
    });
  }

  /** 指定ケースの設定だけを削除する。 */
  deleteAlgorithmPreference(caseKey: string): Promise<void> {
    return this.enqueueWrite(async (database) => {
      await database.delete('algorithmPreferences', caseKey);
    });
  }
  /** 通常の書き込みを呼び出し順に実行する。 */
  private enqueueWrite(
    operation: (database: IDBPDatabase<CubeRepsDatabase>) => Promise<void>,
  ): Promise<void> {
    const result = this.writeQueue.then(async () => operation(await this.database));
    this.writeQueue = result.catch(() => undefined);
    return result;
  }
  /** @returns 必要なストアと検索インデックスを持つデータベース */
  private openDatabase(): Promise<IDBPDatabase<CubeRepsDatabase>> {
    return openDB<CubeRepsDatabase>(IndexedDbUserDataRepository.databaseName, 4, {
      upgrade(database, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          const solves = database.createObjectStore('solves', { keyPath: 'id' });
          solves.createIndex('createdAt', 'createdAt');
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
        if (oldVersion < 4) {
          const solves = transaction.objectStore('solves');
          if (solves.indexNames.contains('date' as 'createdAt'))
            solves.deleteIndex('date' as 'createdAt');
          if (!solves.indexNames.contains('createdAt'))
            solves.createIndex('createdAt', 'createdAt');
          // 計測日時を保持して旧レコードを更新し、索引から記録が抜け落ちることを防ぐ。
          for (const name of ['solves', 'groups', 'algorithmPreferences'] as const) {
            void (async () => {
              let cursor = await transaction.objectStore(name).openCursor();
              while (cursor) {
                const { date, ...value } = cursor.value as typeof cursor.value & { date?: string };
                const { ownerId, ...metadata } = value;
                await cursor.update({
                  ...metadata,
                  ...(value.ownerType === 'account' ? { ownerId } : {}),
                  ownerType: value.ownerType === 'account' ? 'account' : 'guest',
                  createdAt: value.createdAt ?? date ?? value.updatedAt,
                  schemaVersion: USER_DATA_SCHEMA_VERSION,
                });
                cursor = await cursor.continue();
              }
            })();
          }
        }
        if (oldVersion < 3) {
          database.createObjectStore('accounts', { keyPath: 'uid' });
          void transaction.objectStore('metadata').delete('guestOwnerId');
        }
      },
    });
  }
}
