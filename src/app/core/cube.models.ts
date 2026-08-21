/** アプリ内で切り替え可能な画面。 */
export type View = 'timer' | 'algorithms' | 'history';

/** 計測対象となる練習モード。 */
export type SolveMode = '3x3' | 'PLL';

/** 計測記録へ適用できるペナルティ。 */
export type Penalty = 'none' | '+2' | 'DNF';

/** 計測記録を分類するユーザー定義グループ。 */
export interface RecordGroup {
  /** グループを一意に識別するID。 */
  id: string;
  /** 画面に表示するグループ名。 */
  name: string;
  /** グループを作成した日時を表すISO 8601文字列。 */
  createdAt: string;
}

/** 1回分の計測結果。 */
export interface Solve {
  /** 計測記録を一意に識別するID。 */
  id: number;
  /** ペナルティ適用前の計測時間（ミリ秒）。 */
  time: number;
  /** 計測時に使用したスクランブル。 */
  scramble: string;
  /** 計測日時を表すISO 8601文字列。 */
  date: string;
  /** 計測時の練習モード。 */
  mode: SolveMode;
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

/** OLLまたはPLLのケースと登録済み手順。 */
export interface AlgorithmCase {
  /** ケースの種別。 */
  kind: 'OLL' | 'PLL';
  /** ケース番号または識別名。 */
  number: string;
  /** ケースの代表名。 */
  name: string;
  /** 検索と表示に使用する別名。 */
  aliases?: readonly string[];
  /** ケースの分類名。 */
  group: string;
  /** 組み込み手順の一覧。 */
  algorithms: readonly string[];
  /** ケースを表すステッカーパターン。 */
  pattern: CubePattern;
}
