import { Injectable, isDevMode } from '@angular/core';
import type { Firestore } from 'firebase/firestore';
import { Solve } from '../cube.models';
import { firebaseConfig } from '../auth/firebase.config';
import { fromFirestoreSolve, toFirestoreSolve } from './firestore-solve.mapper';

/** ログインユーザー単位でCloud FirestoreのSolveをCRUDするデータアクセスサービス。 */
@Injectable({ providedIn: 'root' })
export class FirestoreSolveRepository {
  /** 初回のクラウド操作時だけ作成して共有するFirestoreクライアント。 */
  private firestore?: Promise<Firestore>;

  /**
   * UUIDをドキュメントIDとしてSolveを追加または置換する。
   *
   * @param userId Firebase AuthenticationのUID
   * @param solve 保存する計測記録
   */
  async put(userId: string, solve: Solve): Promise<void> {
    const [firestore, { doc, serverTimestamp, setDoc }] = await Promise.all([
      this.firestoreClient(),
      import('firebase/firestore'),
    ]);
    await setDoc(doc(firestore, 'users', userId, 'solves', solve.id), {
      ...toFirestoreSolve(solve, userId),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * ユーザーのSolve変更をFirestoreのローカルキャッシュを含めて継続購読する。
   *
   * @param userId Firebase AuthenticationのUID
   * @param next 最新スナップショットと書き込み状態を受け取る処理
   * @param error 購読を継続できない場合の処理
   * @returns 購読解除処理を解決するPromise
   */
  async watch(
    userId: string,
    next: (solves: Solve[], pending: boolean, fromCache: boolean) => void,
    error: () => void,
  ): Promise<() => void> {
    const [firestore, { collection, onSnapshot, orderBy, query }] = await Promise.all([
      this.firestoreClient(),
      import('firebase/firestore'),
    ]);
    return onSnapshot(
      query(collection(firestore, 'users', userId, 'solves'), orderBy('date', 'desc')),
      { includeMetadataChanges: true },
      (snapshot) =>
        next(
          snapshot.docs.flatMap((item) => {
            const solve = fromFirestoreSolve(
              item.id,
              item.data({ serverTimestamps: 'estimate' }),
              userId,
            );
            return solve ? [solve] : [];
          }),
          snapshot.metadata.hasPendingWrites,
          snapshot.metadata.fromCache,
        ),
      error,
    );
  }

  /**
   * アカウント所有Solveを物理削除せずtombstoneへ更新する。
   *
   * @param userId Firebase AuthenticationのUID
   * @param solve 削除直前の計測記録
   */
  async tombstone(userId: string, solve: Solve): Promise<void> {
    const [firestore, { doc, serverTimestamp, setDoc }] = await Promise.all([
      this.firestoreClient(),
      import('firebase/firestore'),
    ]);
    await setDoc(doc(firestore, 'users', userId, 'solves', solve.id), {
      ...toFirestoreSolve(solve, userId),
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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
      this.firestoreClient(),
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
      this.firestoreClient(),
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
      this.firestoreClient(),
      import('firebase/firestore'),
    ]);
    await deleteDoc(doc(firestore, 'users', userId, 'solves', solveId));
  }

  /** Firebase SDKを遅延ロードしてFirestoreクライアントを初期化する。 */
  private async initializeFirestore(): Promise<Firestore> {
    const [
      { getApp, getApps, initializeApp },
      {
        connectFirestoreEmulator,
        getFirestore,
        initializeFirestore,
        persistentLocalCache,
        persistentMultipleTabManager,
      },
    ] = await Promise.all([import('firebase/app'), import('firebase/firestore')]);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    let firestore: Firestore;
    try {
      firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
    } catch {
      firestore = getFirestore(app);
    }
    if (isDevMode()) connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    return firestore;
  }

  /** @returns 遅延初期化し、以後の操作で共有するFirestoreクライアント */
  private firestoreClient(): Promise<Firestore> {
    this.firestore ??= this.initializeFirestore();
    return this.firestore;
  }
}
