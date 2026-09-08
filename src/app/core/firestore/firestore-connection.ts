import { Injectable, isDevMode } from '@angular/core';
import type { Firestore } from 'firebase/firestore';
import { firebaseConfig } from '../auth/firebase.config';

/** データ種別に依存せずFirestore接続と永続キャッシュを共有する。 */
@Injectable({ providedIn: 'root' })
export class FirestoreConnection {
  /** 初回だけ初期化し、全Repositoryで共有する接続。 */
  private firestore?: Promise<Firestore>;
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
  client(): Promise<Firestore> {
    this.firestore ??= this.initializeFirestore();
    return this.firestore;
  }
}
