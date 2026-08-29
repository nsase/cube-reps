import { importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from '../public/assets/i18n/en.json';
import ja from '../public/assets/i18n/ja.json';
import { AlgorithmPreference, Solve, RecordGroup } from './app/core/cube.models';
import { UserDataRepository, StoredUserData } from './app/core/user-data-repository';

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
      guestOwnerId: crypto.randomUUID(),
    };
  }

  /** @param solves Signalから保存される現在の計測記録 */
  override async replaceSolves(solves: readonly Solve[]): Promise<void> {
    this.solves = [...solves];
  }

  /** @param groups Signalから保存される現在のユーザー定義グループ */
  override async replaceGroups(groups: readonly RecordGroup[]): Promise<void> {
    this.groups = [...groups];
  }

  /** @param preferences Signalから保存される現在のユーザー手順設定 */
  override async replaceAlgorithmPreferences(
    preferences: readonly AlgorithmPreference[],
  ): Promise<void> {
    this.algorithmPreferences = [...preferences];
  }
}

/** コンポーネントテストでHTTP通信せず利用する翻訳プロバイダー。 */
export default [
  { provide: UserDataRepository, useClass: TestUserDataRepository },
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
