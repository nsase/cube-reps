import { RecordGroup } from '../cube.models';
import { USER_DATA_SCHEMA_VERSION } from '../user-data-repository';
import { isRecord, omitUndefined, readDate } from './utils';

/** Firestoreへ保存するグループの現行形式。 */
export interface FirestoreRecordGroupDocument {
  /** グループを一意に識別するID。 */
  readonly id: string;
  /** 画面に表示するグループ名。 */
  readonly name: string;
  /** Firestoreがtimestampとして保存するグループ作成日時。 */
  readonly createdAt: Date;
  /** 保存形式のバージョン。 */
  readonly schemaVersion: number;
  /** Firestoreで競合判定に利用できる更新日時。 */
  readonly updatedAt: Date;
  /** Firebase Authenticationの所有者UID。 */
  readonly ownerId: string;
  /** クラウド上では常にアカウント所有とする種別。 */
  readonly ownerType: 'account';
  /** 削除済みグループを表すサーバー確定日時。 */
  readonly deletedAt?: Date;
}

/**
 * 現行グループをFirestoreの保存形式へ変換する。
 * クラウド上の所有者は呼び出し元の認証UIDで上書きし、端末のゲスト所有情報を送信しない。
 *
 * @param group 保存するグループ
 * @param userId Firebase AuthenticationのUID
 * @returns Firestoreがtimestampとして保存するDateを使用したドキュメント
 */
export function toFirestoreGroupRecord(
  group: RecordGroup,
  userId: string,
): FirestoreRecordGroupDocument {
  const { pendingSync: _localPending, copiedFromId: _localSource, ...document } = group;
  return omitUndefined({
    ...document,
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt),
    deletedAt: group.deletedAt ? new Date(group.deletedAt) : undefined,
    ownerId: userId,
    ownerType: 'account' as const,
    schemaVersion: USER_DATA_SCHEMA_VERSION,
  });
}

/**
 * Firestoreの現行・旧形式をアプリの現行グループへ正規化する。
 * 追加フィールドや省略可能項目の欠落を許容し、将来の段階的な移行でも読み込みを継続できるようにする。
 *
 * @param id FirestoreドキュメントID
 * @param value Firestoreから取得したデータ
 * @param userId 読み込み対象ユーザーのUID
 * @returns 必須項目を読み取れた場合の現行グループ
 */
export function fromFirestoreRecordGroup(
  id: string,
  value: unknown,
  userId: string,
): RecordGroup | undefined {
  if (!isRecord(value) || typeof value['name'] !== 'string' || !value['name'].trim())
    return undefined;
  const createdAt = readDate(value['createdAt']);
  if (!createdAt) return undefined;
  const updatedAt = readDate(value['updatedAt']) ?? createdAt;
  return omitUndefined({
    id,
    name: value['name'],
    createdAt,
    updatedAt,
    deletedAt: readDate(value['deletedAt']),
    ownerType: 'account' as const,
    ownerId: userId,
    schemaVersion: typeof value['schemaVersion'] === 'number' ? value['schemaVersion'] : 0,
  });
}
