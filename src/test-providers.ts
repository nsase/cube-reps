import { importProvidersFrom } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { NEVER } from 'rxjs';
import en from '../public/assets/i18n/en.json';
import ja from '../public/assets/i18n/ja.json';
import { AuthenticatedUser, AuthGateway } from './app/core/auth/auth.gateway';
import { AlgorithmPreference, RecordGroup, Solve } from './app/core/cube.models';
import { StoredUserData, UserDataRepository } from './app/core/user-data-repository';

/** コンポーネントテスト間でIndexedDB状態を共有しないメモリRepository。 */
class TestUserDataRepository extends UserDataRepository {
  /** テスト内で保存された計測記録。 */
  private solves: Solve[] = [];

  /** テスト内で保存されたユーザー定義グループ。 */
  private groups: RecordGroup[] = [];
  /** テスト内で保存されたユーザー手順設定。 */
  private algorithmPreferences: AlgorithmPreference[] = [];
  /** @returns テストごとに独立した保存データ */
  override async load(): Promise<StoredUserData> {
    return {
      solves: this.solves,
      groups: this.groups,
      algorithmPreferences: this.algorithmPreferences,
      guestOwnerId: 'guest-test',
    };
  }

  /** @param solve 追加または更新する計測記録 */
  override async putSolve(solve: Solve): Promise<void> {
    this.solves = [...this.solves.filter(({ id }) => id !== solve.id), solve];
  }

  /** @param id 削除する計測記録ID */
  override async deleteSolve(id: string): Promise<void> {
    this.solves = this.solves.filter((solve) => solve.id !== id);
  }

  /** @param group 追加または更新するユーザー定義グループ */
  override async putRecordGroup(group: RecordGroup): Promise<void> {
    this.groups = [...this.groups.filter(({ id }) => id !== group.id), group];
  }

  /** @param id 削除するユーザー定義グループID */
  override async deleteRecordGroup(id: string): Promise<void> {
    this.groups = this.groups.filter((group) => group.id !== id);
  }

  /** @param preference 追加または更新するユーザー手順設定 */
  override async putAlgorithmPreference(preference: AlgorithmPreference): Promise<void> {
    this.algorithmPreferences = [
      ...this.algorithmPreferences.filter(({ caseKey }) => caseKey !== preference.caseKey),
      preference,
    ];
  }

  /** @param caseKey 削除するユーザー手順設定のケースキー */
  override async deleteAlgorithmPreference(caseKey: string): Promise<void> {
    this.algorithmPreferences = this.algorithmPreferences.filter(
      (preference) => preference.caseKey !== caseKey,
    );
  }
}

/** コンポーネントテストでFirebaseへ接続せず未ログイン状態を返すGateway。 */
class TestAuthGateway extends AuthGateway {
  /**  */
  override observe(next: (user: AuthenticatedUser | null) => void): () => void {
    next(null);
    return () => undefined;
  }

  /**  */
  override async signIn(): Promise<void> {}

  /**  */
  override async signOut(): Promise<void> {}
}

/** コンポーネントテストでHTTP通信せず利用する翻訳プロバイダー。 */
export default [
  { provide: AuthGateway, useClass: TestAuthGateway },
  { provide: UserDataRepository, useClass: TestUserDataRepository },
  {
    provide: SwUpdate,
    useValue: { isEnabled: false, versionUpdates: NEVER, activateUpdate: async () => false },
  },
  importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { ja, en },
      translocoConfig: {
        availableLangs: ['ja', 'en'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
      },
      preloadLangs: true,
    }),
  ),
];
