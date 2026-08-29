import { Injectable, inject, signal } from '@angular/core';
import { AlgorithmCase, AlgorithmPreference, CaseAlgorithm } from './cube.models';
import { USER_DATA_SCHEMA_VERSION, UserDataRepository } from './user-data-repository';
export type { CaseAlgorithm } from './cube.models';

/** ケースキーごとのユーザー設定。 */
type AlgorithmPreferences = Record<string, AlgorithmPreference>;

/** OLL/PLL手順のお気に入りとユーザー追加手順を管理するサービス。 */
@Injectable({ providedIn: 'root' })
export class AlgorithmLibraryService {
  /** ユーザー設定の永続化を画面から分離するRepository。 */
  private readonly repository = inject(UserDataRepository);
  /** Repository初期化前の操作でも使用できる一時ゲストUUID。 */
  private readonly initialGuestOwnerId = crypto.randomUUID();
  /** 現在のゲスト所有者UUID。 */
  private readonly guestOwnerId = signal<string>(this.initialGuestOwnerId);
  /** ケースキーごとの保存済みユーザー設定。 */
  private readonly preferences = signal<AlgorithmPreferences>({});
  /** IndexedDB初期化後の変更だけを保存するフラグ。 */
  private readonly storageReady = signal(false);
  /** 旧データ移行とIndexedDBからの復元が完了したときに解決するPromise。 */
  readonly ready = this.initializeStorage();

  /** @returns 種別と番号を組み合わせたケース固有キー */
  caseKey(item: AlgorithmCase): string {
    return `${item.kind}-${item.number}`;
  }

  /** @returns 組み込み手順の後ろにユーザー手順を連結した一覧 */
  algorithmsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return [...item.algorithms, ...this.preferenceFor(item).custom];
  }

  /** @returns お気に入り手順。未設定または不明なIDの場合は先頭手順 */
  favoriteFor(item: AlgorithmCase): CaseAlgorithm | undefined {
    const algorithms = this.algorithmsFor(item);
    const favoriteId = this.preferenceFor(item).favoriteId;
    return algorithms.find((algorithm) => algorithm.id === favoriteId) ?? algorithms[0];
  }

  /** @returns 代表表示する手順。手順がない場合は案内文 */
  primaryNotation(item: AlgorithmCase): string {
    return this.favoriteFor(item)?.notation ?? '手順未登録';
  }

  /**
   * 存在する手順をお気に入りに設定する。
   *
   * @param item 対象ケース
   * @param id お気に入りにする手順ID
   */
  setFavorite(item: AlgorithmCase, id: string): void {
    if (!this.algorithmsFor(item).some((algorithm) => algorithm.id === id)) return;
    this.save(item, { ...this.preferenceFor(item), favoriteId: id });
  }

  /**
   * 重複していないユーザー手順を追加する。
   *
   * @param item 対象ケース
   * @param notation 追加する手順
   * @returns 追加できた場合は`true`
   */
  add(item: AlgorithmCase, notation: string): boolean {
    const value = notation.trim();
    if (!value) return false;
    if (this.algorithmsFor(item).some((algorithm) => algorithm.notation === value)) return false;
    const preference = this.preferenceFor(item);
    this.save(item, {
      ...preference,
      custom: [...preference.custom, { id: crypto.randomUUID(), notation: value, builtIn: false }],
    });
    return true;
  }

  /**
   * ユーザーが追加した手順だけを削除する。
   *
   * @param item 対象ケース
   * @param id 削除するユーザー手順ID
   */
  remove(item: AlgorithmCase, id: string): void {
    const preference = this.preferenceFor(item);
    if (!preference.custom.some((algorithm) => algorithm.id === id)) return;
    this.save(item, {
      ...preference,
      custom: preference.custom.filter((algorithm) => algorithm.id !== id),
      favoriteId: preference.favoriteId === id ? undefined : preference.favoriteId,
    });
  }

  /** @returns ケースの保存済み設定。未保存の場合は同期情報付きの空設定 */
  private preferenceFor(item: AlgorithmCase): AlgorithmPreference {
    const caseKey = this.caseKey(item);
    return (
      this.preferences()[caseKey] ?? {
        caseKey,
        custom: [],
        updatedAt: new Date(0).toISOString(),
        ownerType: 'guest',
        ownerId: this.guestOwnerId(),
        schemaVersion: USER_DATA_SCHEMA_VERSION,
      }
    );
  }

  /** 指定ケースの設定を状態へ保存し、変更されたケースだけを永続化する。 */
  private save(item: AlgorithmCase, preference: AlgorithmPreference): void {
    const caseKey = this.caseKey(item);
    const updated: AlgorithmPreference = {
      ...preference,
      caseKey,
      updatedAt: new Date().toISOString(),
      ownerType: 'guest',
      ownerId: this.guestOwnerId(),
      schemaVersion: USER_DATA_SCHEMA_VERSION,
    };
    const shouldDelete = updated.custom.length === 0 && !updated.favoriteId;
    this.preferences.update((preferences) => {
      if (!shouldDelete) return { ...preferences, [caseKey]: updated };
      const remaining = { ...preferences };
      delete remaining[caseKey];
      return remaining;
    });
    if (!this.storageReady()) return;
    if (shouldDelete) void this.repository.deleteAlgorithmPreference(caseKey);
    else void this.repository.putAlgorithmPreference(updated);
  }

  /** IndexedDBの復元値と起動直後の変更をケースキー単位で統合する。 */
  private async initializeStorage(): Promise<void> {
    const stored = await this.repository.load();
    this.guestOwnerId.set(stored.guestOwnerId);
    const current = Object.values(this.preferences()).map((preference) =>
      preference.ownerId === this.initialGuestOwnerId
        ? { ...preference, ownerId: stored.guestOwnerId }
        : preference,
    );
    const currentKeys = new Set(current.map(({ caseKey }) => caseKey));
    this.preferences.set(
      Object.fromEntries(
        [
          ...current,
          ...stored.algorithmPreferences.filter(({ caseKey }) => !currentKeys.has(caseKey)),
        ].map((preference) => [preference.caseKey, preference]),
      ),
    );
    await Promise.all(
      current.map((preference) => this.repository.putAlgorithmPreference(preference)),
    );
    this.storageReady.set(true);
  }
}
