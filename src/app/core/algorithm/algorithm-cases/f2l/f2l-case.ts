import { CaseAlgorithm, F2lCase, F2lAlgorithmCase, F2lSlot } from '../../../cube/cube.models';

/** ケース共通情報と、独立した4スロットの元データ。 */
interface F2lCaseDefinition {
  /** 表示番号。参照サイトとの対応は各ケースのコメントに記載する。 */
  number: string;
  /** 形状による分類。 */
  group: string;
  /** 完成状態からFRの対象ペアを作る共通スクランブル。 */
  setup: string;
  /** 対象スロットごとの解法。 */
  slots: Record<
    F2lSlot,
    {
      /** このスロットの組み込み手順。 */
      algorithms: readonly Omit<CaseAlgorithm, 'builtIn'>[];
    }
  >;
}

/**
 * 4スロットの手順を組み込みとして登録する。
 * @param definition 番号・分類と各スロットの定義
 * @returns スロット間で手順配列を共有しないケース
 */
export function defineF2lCase(definition: F2lCaseDefinition): F2lCase {
  const slots = {} as F2lCase['slots'];
  for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
    const data = definition.slots[slot];
    slots[slot] = {
      algorithms: data.algorithms.map((algorithm) => ({ ...algorithm, builtIn: true })),
    };
  }
  return {
    kind: 'F2L',
    number: definition.number,
    group: definition.group,
    setup: definition.setup,
    slots,
  };
}

/**
 * FR基準の共通Setupに持ち替えを加え、選択スロットの表示・保存用モデルを作る。
 * Setupの重複管理を避け、同じペア配置を持ち替えだけで各スロットへ移す。
 * @param item ケース共通情報と4スロットの定義
 * @param slot 操作対象のスロット
 * @returns スロット固有の保存キーと手順を持つケース
 */
export function f2lCaseForSlot(item: F2lCase, slot: F2lSlot): F2lAlgorithmCase {
  const rotation: Record<F2lSlot, string> = { FR: '', FL: 'y', BL: 'y2', BR: "y'" };
  return {
    kind: item.kind,
    number: item.number,
    group: item.group,
    slot,
    setup: [item.setup, rotation[slot]].filter(Boolean).join(' '),
    ...item.slots[slot],
  };
}
