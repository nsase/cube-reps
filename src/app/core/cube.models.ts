/** 集計単位として扱うsolveカテゴリーの定義。 */
export const SOLVE_CATEGORIES = [
  { id: 'full', labelKey: 'solveCategories.full' },
  { id: 'oll', labelKey: 'solveCategories.oll' },
  { id: 'pll', labelKey: 'solveCategories.pll' },
] as const satisfies ReadonlyArray<{ id: string; labelKey: string }>;

/** 計測記録の集計カテゴリーID。 */
export type SolveCategory = (typeof SOLVE_CATEGORIES)[number]['id'];

/** 計測記録へ適用できるペナルティ。 */
export type Penalty = 'none' | '+2' | 'DNF';

/** 同期対象ユーザーデータの所有主体。 */
export type UserDataOwnerType = 'guest' | 'account';

/** 同期対象ユーザーデータが共通で持つ更新・所有情報。 */
export interface SyncMetadata {
  /** 対象を最後に変更した日時を表すISO 8601文字列。 */
  updatedAt: string;
  /** 対象を所有する主体の種別。 */
  ownerType: UserDataOwnerType;
  /** ゲスト端末UUIDまたは将来のアカウントUID。 */
  ownerId: string;
  /** このレコードが準拠する保存スキーマのバージョン。 */
  schemaVersion: number;
}

/** 計測記録を分類するユーザー定義グループ。 */
export interface RecordGroup extends SyncMetadata {
  /** グループを一意に識別するID。 */
  id: string;
  /** 画面に表示するグループ名。 */
  name: string;
  /** グループを作成した日時を表すISO 8601文字列。 */
  createdAt: string;
}

/** 1回分の計測結果。 */
export interface Solve extends SyncMetadata {
  /** 計測記録を一意に識別するID。 */
  id: string;
  /** ペナルティ適用前の計測時間（ミリ秒）。 */
  time: number;
  /** 計測時に使用したスクランブル。 */
  scramble: string;
  /** 計測日時を表すISO 8601文字列。 */
  date: string;
  /** 記録を独立して集計するsolveカテゴリー。 */
  category: SolveCategory;
  /** PLL練習時のケース名。 */
  caseName?: string;
  /** 記録が属するグループID。 */
  groupId?: string;
  /** 記録へ適用されたペナルティ。 */
  penalty: Penalty;
}

/** キューブ表示で使用するステッカー色。 */
export type StickerColor = 'yellow' | 'white' | 'green' | 'blue' | 'red' | 'orange' | 'none';

/** OLL/PLL表示用の読み取り専用ステッカー配列。 */
export type CubePattern = ReadonlyArray<ReadonlyArray<StickerColor>>;

/** 画面に表示する組み込みまたはユーザー登録手順。 */
export interface CaseAlgorithm {
  /** ケース内で手順を識別するID。 */
  id: string;
  /** キューブ記法による手順文字列。 */
  notation: string;
  /** アプリに組み込まれた削除不可の手順かどうか。 */
  builtIn: boolean;
}

/** OLL／PLLケース単位で同期するユーザー設定。 */
export interface AlgorithmPreference extends SyncMetadata {
  /** OLL／PLL種別とケース番号を組み合わせた固定キー。 */
  caseKey: string;
  /** ユーザーが追加した手順。 */
  custom: CaseAlgorithm[];
  /** お気に入り手順のID。 */
  favoriteId?: string;
}

/** OLLまたはPLLのケースと登録済み手順。 */
export interface AlgorithmCase {
  /** ケースの種別。 */
  kind: 'OLL' | 'PLL';
  /**
   * ケース番号または識別名。
   * OLL: 01～57, PLL: Aa, Tなど
   */
  number: string;
  /**
   * ケース名。複数の呼称がある場合は表示用に連結した文字列。
   * OLL: Sune, Bowtieなど, PLL: Aa-perm, T-permなど
   */
  name: string;
  /**
   * ケースの分類名。
   * OLL: Dot, Small L Shape, T Shapeなど, PLL: Corner, Edge, Mixed
   */
  group: string;
  /** Timerでケースを固定出題するためのSetup。 */
  setup: string;
  /** 組み込み手順の一覧。 */
  algorithms: readonly CaseAlgorithm[];
}

/** 保存・同期せず画面表示にだけ使用するアプリ組み込みグループ。 */
export interface BuiltInRecordGroup extends Omit<RecordGroup, keyof SyncMetadata> {
  /** 表示言語に応じてグループ名を切り替える翻訳キー。 */
  nameKey: string;
}

/** 履歴とタイマーに表示できる記録グループ。 */
export type DisplayRecordGroup = BuiltInRecordGroup | RecordGroup;
