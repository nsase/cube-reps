import { AlgorithmCase, CubePattern } from '../../cube.models';

/** OLLケース生成時に必要な元データ。 */
interface OllCaseDefinition {
  /** 2桁のOLL番号。 */
  number: string;
  /** 代表名を先頭にしたケース名一覧。 */
  names: readonly string[];
  /** OLL形状による分類。 */
  group: string;
  /** 組み込み手順。 */
  algorithms: readonly string[];
  /** 黄色の向きを示す5行5列パターン。 */
  pattern: CubePattern;
}

/**
 * OLL固有の元データを共通のケースモデルへ変換する。
 *
 * @param definition OLLケースの元データ
 * @returns 種別と代表名を補完したケース
 */
export function defineOllCase(definition: OllCaseDefinition): AlgorithmCase {
  return {
    kind: 'OLL',
    number: definition.number,
    name: definition.names[0] ?? `OLL ${Number(definition.number)}`,
    aliases: definition.names,
    group: definition.group,
    algorithms: definition.algorithms,
    pattern: definition.pattern,
  };
}
