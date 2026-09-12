import { SyncMetadata } from './cube.models';

/**
 * Storeに保持している未送信の変更と、受信した変更の優先順位を決める。
 * 通常版同士では未送信の変更を保持し、同期済みの版を更新日時で比較する。
 *
 * @param local 同じIDで端末に保持している同期メタデータ
 * @param remote Firestoreから受信した同期メタデータ
 * @returns リモートをマージ候補にする場合はtrue
 */
export function remoteWins(local: SyncMetadata | undefined, remote: SyncMetadata): boolean {
  // ローカルにない場合、リモートデータが削除されていなければリモートを優先する
  if (!local) return !remote.deletedAt;
  // 削除状態が異なる場合、更新日時や未送信の変更より削除を優先する
  if (Boolean(local.deletedAt) !== Boolean(remote.deletedAt)) return !!remote.deletedAt;
  // ローカルデータがアップロード待機中の場合はローカルを優先する
  if (local.pendingSync) return false;
  // 更新日時の新しい方を優先する
  return Date.parse(remote.updatedAt) > Date.parse(local.updatedAt);
}

/**
 * 現在の同期メタデータが最新かどうかを判定する。
 *
 * @param current ローカルの同期メタデータ
 * @param uploaded アップロード済みの同期メタデータ
 * @returns 最新であれば`true`
 */
export function isLatestSyncData(current: SyncMetadata, uploaded: SyncMetadata): boolean {
  return !!(
    current?.pendingSync &&
    current.ownerId === uploaded.ownerId &&
    current.updatedAt === uploaded.updatedAt
  );
}
