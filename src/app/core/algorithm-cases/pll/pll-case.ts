import { AlgorithmCase, BuiltInAlgorithm } from '../../cube.models';

/** PLLケース生成時に必要な元データ。 */
interface PllCaseDefinition {
  /** PLLケースの識別名。 */
  number: string;
  /** 置換対象による分類。 */
  group: string;
  /** Timerでケースを固定出題するためのSetup。 */
  setup: string;
  /** 組み込み手順。 */
  algorithms: readonly BuiltInAlgorithm[];
}

/**
 * PLL固有の元データを共通のケースモデルへ変換する。
 *
 * @param definition PLLケースの元データ
 * @returns 種別と表示名を補完したケース
 */
export function definePllCase(definition: PllCaseDefinition): AlgorithmCase {
  return {
    kind: 'PLL',
    number: definition.number,
    name: definition.number + '-perm',
    group: definition.group,
    setup: definition.setup,
    algorithms: definition.algorithms,
  };
}
