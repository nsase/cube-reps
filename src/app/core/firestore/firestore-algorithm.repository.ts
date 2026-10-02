import { inject, Injectable } from '@angular/core';
import { AlgorithmKind } from '../algorithm/algorithm-library';
import { AlgorithmPreference } from '../cube/cube.models';
import { USER_DATA_SCHEMA_VERSION } from '../local-storage/user-data-repository';
import { FirestoreConnection } from './firestore-connection';
import { isRecord, omitUndefined, readDate } from './utils';

/** Firestoreから受け取った設定を検証し、ローカル専用の状態を混入させず復元する。 */
export function readAlgorithmPreference(
  caseKey: string,
  value: unknown,
  userId: string,
): AlgorithmPreference | undefined {
  if (
    !isRecord(value) ||
    value['caseKey'] !== caseKey ||
    value['ownerId'] !== userId ||
    value['ownerType'] !== 'account' ||
    !Array.isArray(value['custom'])
  )
    return undefined;
  const createdAt = readDate(value['createdAt']);
  const updatedAt = readDate(value['updatedAt']);
  if (
    !createdAt ||
    !updatedAt ||
    !value['custom'].every(
      (entry) =>
        isRecord(entry) &&
        typeof entry['id'] === 'string' &&
        typeof entry['notation'] === 'string' &&
        entry['builtIn'] === false,
    )
  )
    return undefined;
  return omitUndefined({
    caseKey,
    custom: value['custom'] as AlgorithmPreference['custom'],
    favoriteId: typeof value['favoriteId'] === 'string' ? value['favoriteId'] : undefined,
    createdAt,
    updatedAt,
    ownerId: userId,
    ownerType: 'account' as const,
    schemaVersion: USER_DATA_SCHEMA_VERSION,
  });
}

/** 種類別クエリで手順設定を取得し、ケース単位の置換で削除とお気に入り解除も同期する。 */
@Injectable({ providedIn: 'root' })
export class FirestoreAlgorithmRepository {
  /** 永続キャッシュを共有するFirestore接続。 */
  private readonly connection = inject(FirestoreConnection);

  /** アカウント設定だけを送信する。空配列も保存して過去の手順を復活させない。 */
  async put(userId: string, preference: AlgorithmPreference): Promise<void> {
    if (preference.ownerType !== 'account' || preference.ownerId !== userId)
      throw new Error('Algorithm owner mismatch');
    const [db, { doc, setDoc, serverTimestamp }] = await Promise.all([
      this.connection.client(),
      import('firebase/firestore'),
    ]);
    await setDoc(
      doc(db, 'users', userId, 'algorithmPreferences', preference.caseKey),
      omitUndefined({
        caseKey: preference.caseKey,
        kind: preference.caseKey.split('-')[0],
        custom: preference.custom.map(({ id, notation }) => ({ id, notation, builtIn: false })),
        favoriteId: preference.favoriteId,
        createdAt: new Date(preference.createdAt),
        updatedAt: serverTimestamp(),
        ownerType: 'account',
        ownerId: userId,
        schemaVersion: USER_DATA_SCHEMA_VERSION,
      }),
    );
  }

  /**
   * 対象種類だけをサーバーで取得する。
   * 不完全なキャッシュを移行時の統合元として扱わず、取得失敗時は端末の設定を維持する。
   */
  async list(userId: string, kind: AlgorithmKind): Promise<AlgorithmPreference[]> {
    const [db, { collection, query, where, getDocsFromServer }] = await Promise.all([
      this.connection.client(),
      import('firebase/firestore'),
    ]);
    const snapshot = await getDocsFromServer(
      query(collection(db, 'users', userId, 'algorithmPreferences'), where('kind', '==', kind)),
    );
    return snapshot.docs.flatMap((doc) => {
      const preference = readAlgorithmPreference(doc.id, doc.data(), userId);
      return preference && preference.caseKey.startsWith(kind + '-') ? [preference] : [];
    });
  }
}
