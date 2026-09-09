import { inject, Injectable } from '@angular/core';
import { RecordGroup } from '../cube.models';
import { FirestoreConnection } from './firestore-connection';
import { fromFirestoreRecordGroup, toFirestoreGroupRecord } from './firestore-group.mapper';

/** 同じFirestore接続を使用し、アカウントのグループを保存・取得する。 */
@Injectable({ providedIn: 'root' })
export class FirestoreGroupRepository {
  /** 永続キャッシュとエミュレーター接続を共有する境界。 */
  private readonly connection = inject(FirestoreConnection);

  /** グループの更新と削除通知を保存する。 */
  async put(userId: string, group: RecordGroup): Promise<void> {
    const [db, { doc, setDoc, serverTimestamp }] = await Promise.all([
      this.connection.client(),
      import('firebase/firestore'),
    ]);
    await setDoc(doc(db, 'users', userId, 'groups', group.id), {
      ...toFirestoreGroupRecord(group, userId),
      updatedAt: serverTimestamp(),
      ...(group.deletedAt ? { deletedAt: serverTimestamp() } : {}),
    });
  }

  /** 他端末でも削除状態を維持できるようtombstoneを保存する。 */
  async tombstone(userId: string, group: RecordGroup): Promise<void> {
    await this.put(userId, group);
  }

  /** 削除通知を含むグループを取得する。 */
  async list(userId: string): Promise<RecordGroup[]> {
    const [db, { collection, getDocs }] = await Promise.all([
      this.connection.client(),
      import('firebase/firestore'),
    ]);
    const snapshot = await getDocs(collection(db, 'users', userId, 'groups'));
    return snapshot.docs.flatMap((item) => {
      const group = fromFirestoreRecordGroup(item.id, item.data(), userId);
      return group ? [group] : [];
    });
  }
}
