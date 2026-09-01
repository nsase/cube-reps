import { Injectable } from '@angular/core';
import type { Firestore } from 'firebase/firestore';
import { Solve } from '../cube.models';
import { firebaseConfig } from '../auth/firebase.config';
import { fromFirestoreSolve, toFirestoreSolve } from './firestore-solve.mapper';

/** ログインユーザー単位でCloud FirestoreのSolveをCRUDするデータアクセスサービス。 */
@Injectable({ providedIn: 'root' })
export class FirestoreSolveRepository {
  /** 初期化済みFirebaseアプリに紐づくFirestoreクライアント。 */
  private readonly firestore = this.initializeFirestore();

  /**
   * UUIDをドキュメントIDとしてSolveを追加または置換する。
   *
   * @param userId Firebase AuthenticationのUID
   * @param solve 保存する計測記録
   */
  async put(userId: string, solve: Solve): Promise<void> {
    const [firestore, { doc, setDoc }] = await Promise.all([
      this.firestore,
      import('firebase/firestore'),
    ]);
    await setDoc(
      doc(firestore, 'users', userId, 'solves', solve.id),
      toFirestoreSolve(solve, userId),
    );
  }

  /**
   * ユーザーのSolveを計測日時の新しい順で取得する。
   * 読み取れない破損ドキュメントは他の正常な記録を妨げないよう除外する。
   *
   * @param userId Firebase AuthenticationのUID
   * @returns 現行形式へ変換した計測記録
   */
  async list(userId: string): Promise<Solve[]> {
    const [firestore, { collection, getDocs, orderBy, query }] = await Promise.all([
      this.firestore,
      import('firebase/firestore'),
    ]);
    const snapshot = await getDocs(
      query(collection(firestore, 'users', userId, 'solves'), orderBy('date', 'desc')),
    );
    return snapshot.docs.flatMap((item) => {
      const solve = fromFirestoreSolve(item.id, item.data(), userId);
      return solve ? [solve] : [];
    });
  }

  /**
   * 指定したUUIDのSolveを取得する。
   *
   * @param userId Firebase AuthenticationのUID
   * @param solveId 取得するSolveのUUID
   * @returns 記録が存在し、現行形式へ変換できた場合のSolve
   */
  async get(userId: string, solveId: string): Promise<Solve | undefined> {
    const [firestore, { doc, getDoc }] = await Promise.all([
      this.firestore,
      import('firebase/firestore'),
    ]);
    const snapshot = await getDoc(doc(firestore, 'users', userId, 'solves', solveId));
    return snapshot.exists() ? fromFirestoreSolve(snapshot.id, snapshot.data(), userId) : undefined;
  }

  /**
   * 指定したUUIDのSolveを削除する。
   *
   * @param userId Firebase AuthenticationのUID
   * @param solveId 削除するSolveのUUID
   */
  async delete(userId: string, solveId: string): Promise<void> {
    const [firestore, { deleteDoc, doc }] = await Promise.all([
      this.firestore,
      import('firebase/firestore'),
    ]);
    await deleteDoc(doc(firestore, 'users', userId, 'solves', solveId));
  }

  /** Firebase SDKを遅延ロードしてFirestoreクライアントを初期化する。 */
  private async initializeFirestore(): Promise<Firestore> {
    const [{ getApp, getApps, initializeApp }, { getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
    ]);
    return getFirestore(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));
  }
}
