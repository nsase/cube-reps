import { CaseAlgorithm, F2lAlgorithmCase, F2lSlot } from '../../../cube/cube.models';

/** F2Lケース生成時に必要な元データ。 */
interface F2lCaseDefinition {
  /** 表示番号から独立した永続ID。 */
  id: string;
  /** 1〜41の表示番号。 */
  number: string;
  /** Setupと解法手順の基準スロット。 */
  slot: F2lSlot;
  /** 完成状態から対象ケースを作る共通Setup。 */
  setup: string;
  /** 基準スロットに対する組み込み手順。 */
  algorithms: readonly Omit<CaseAlgorithm, 'builtIn'>[];
}

/**
 * F2L固有の元データを共通のケースモデルへ変換する。
 * @param definition F2Lケースの元データ
 * @returns 種別・表示名・組み込み手順フラグを補完したケース
 */
export function defineF2lCase(definition: F2lCaseDefinition): F2lAlgorithmCase {
  return {
    id: definition.id,
    kind: 'F2L',
    number: definition.number,
    name: `F2L ${Number(definition.number)}`,
    group: '',
    slot: definition.slot,
    setup: definition.setup,
    algorithms: definition.algorithms.map((algorithm) => ({ ...algorithm, builtIn: true })),
  };
}
