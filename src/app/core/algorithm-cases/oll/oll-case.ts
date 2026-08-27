import { AlgorithmCase, BuiltInAlgorithm, CubePattern } from '../../cube.models';

/** OLLケース生成時に必要な元データ。 */
interface OllCaseDefinition {
  /** 2桁のOLL番号。 */
  number: string;
  /** 表示と検索に使用するケース名一覧。 */
  names: readonly string[];
  /** OLL形状による分類。 */
  group: string;
  /** Timerでケースを固定出題するためのSetup。 */
  setup: string;
  /** 組み込み手順。 */
  algorithms: readonly BuiltInAlgorithm[];
  /** 黄色の向きを示す5行5列パターン。 */
  pattern: CubePattern;
}

/**
 * OLL固有の元データを共通のケースモデルへ変換する。
 *
 * @param definition OLLケースの元データ
 * @returns 種別と表示用のケース名を補完したケース
 */
export function defineOllCase(definition: OllCaseDefinition): AlgorithmCase {
  return {
    kind: 'OLL',
    number: definition.number,
    name: definition.names.join(' / ') || `OLL ${Number(definition.number)}`,
    group: definition.group,
    setup: definition.setup,
    algorithms: definition.algorithms,
    pattern: definition.pattern,
  };
}
