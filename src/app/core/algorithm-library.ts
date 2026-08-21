import { Injectable, effect, signal } from '@angular/core';
import { AlgorithmCase } from './cube.models';

/** 画面に表示する組み込みまたはユーザー登録手順。 */
export interface CaseAlgorithm {
  /** ケース内で手順を識別するID。 */
  id: string;
  /** キューブ記法による手順文字列。 */
  notation: string;
  /** アプリに組み込まれた削除不可の手順かどうか。 */
  builtIn: boolean;
}

/** 1ケース分のユーザー設定。 */
interface CasePreferences {
  /** ユーザーが追加した手順。 */
  custom: CaseAlgorithm[];
  /** お気に入り手順のID。 */
  favoriteId?: string;
}

/** 手順設定を保存するlocalStorageキー。 */
const STORAGE_KEY = 'cubeflow-algorithm-preferences';

/** ケースキーごとのユーザー設定。 */
type AlgorithmPreferences = Record<string, CasePreferences>;

/** OLL/PLL手順のお気に入りとユーザー追加手順を管理するサービス。 */
@Injectable({ providedIn: 'root' })
export class AlgorithmLibraryService {
  /** 保存済みユーザー設定。 */
  private readonly preferences = signal<AlgorithmPreferences>(this.load());

  /** 設定変更をlocalStorageへ同期する。 */
  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences())));
  }

  /** @returns 種別と番号を組み合わせたケース固有キー */
  caseKey(item: AlgorithmCase): string {
    return `${item.kind}-${item.number}`;
  }

  /** @returns 組み込み手順の後ろにユーザー手順を連結した一覧 */
  algorithmsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return [...this.defaultsFor(item), ...this.preferenceFor(item).custom];
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
   * @returns 追加できた場合は`true`
   */
  add(item: AlgorithmCase, notation: string): boolean {
    const value = notation.trim();
    if (!value) return false;
    if (this.algorithmsFor(item).some((algorithm) => algorithm.notation === value)) return false;
    const preference = this.preferenceFor(item);
    this.save(item, {
      ...preference,
      custom: [...preference.custom, { id: `user-${Date.now()}`, notation: value, builtIn: false }],
    });
    return true;
  }

  /** ユーザーが追加した手順だけを削除する。 */
  remove(item: AlgorithmCase, id: string): void {
    const preference = this.preferenceFor(item);
    if (!preference.custom.some((algorithm) => algorithm.id === id)) return;
    this.save(item, {
      custom: preference.custom.filter((algorithm) => algorithm.id !== id),
      favoriteId: preference.favoriteId === id ? undefined : preference.favoriteId,
    });
  }

  /** @returns ケース定義を表示用の組み込み手順へ変換した一覧 */
  private defaultsFor(item: AlgorithmCase): CaseAlgorithm[] {
    return item.algorithms.map((notation, index) => ({
      id: `built-in-${index}`,
      notation,
      builtIn: true,
    }));
  }

  /** @returns ケースの保存済み設定。未保存の場合は空の設定 */
  private preferenceFor(item: AlgorithmCase): CasePreferences {
    return this.preferences()[this.caseKey(item)] ?? { custom: [] };
  }

  /** 指定ケースの設定を状態へ保存する。 */
  private save(item: AlgorithmCase, preference: CasePreferences): void {
    this.preferences.update((preferences) => ({
      ...preferences,
      [this.caseKey(item)]: preference,
    }));
  }

  /** @returns localStorageから復元した設定。不正なJSONの場合は空の設定 */
  private load(): AlgorithmPreferences {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as AlgorithmPreferences;
    } catch {
      return {};
    }
  }
}
