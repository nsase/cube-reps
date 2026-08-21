import { AlgorithmCase, CubePattern, StickerColor } from '../../cube.models';

/** 5行5列パターンの外周を時計回りに並べた座標。 */
const OUTER_RING: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 1],
  [4, 2],
  [4, 3],
  [3, 4],
  [2, 4],
  [1, 4],
  [0, 3],
  [0, 2],
  [0, 1],
];

/** PLLケース生成時に必要な元データ。 */
interface PllCaseDefinition {
  /** PLLケースの識別名。 */
  number: string;
  /** 置換対象による分類。 */
  group: string;
  /** 組み込み手順。 */
  algorithms: readonly string[];
  /** 任意の5行5列ステッカーパターン。 */
  pattern?: CubePattern;
  /** パターン未指定時の仮パターン生成に使うシード。 */
  patternSeed?: number;
}

/**
 * PLL固有の元データを共通のケースモデルへ変換する。
 *
 * @param definition PLLケースの元データ
 * @returns 種別、表示名、パターンを補完したケース
 */
export function definePllCase(definition: PllCaseDefinition): AlgorithmCase {
  return {
    kind: 'PLL',
    number: definition.number,
    name: definition.number + '-perm',
    group: definition.group,
    algorithms: definition.algorithms,
    pattern: definition.pattern ?? createPlaceholderPattern(definition.patternSeed ?? 0),
  };
}

/**
 * シード値から識別可能な仮のPLLパターンを生成する。
 *
 * @param seed 外周色の開始位置を決める値
 * @returns 黄色上面と回転した外周色からなるパターン
 */
function createPlaceholderPattern(seed: number): CubePattern {
  const pattern = Array.from({ length: 5 }, () => Array<StickerColor>(5).fill('none'));
  for (let y = 1; y <= 3; y++) {
    for (let x = 1; x <= 3; x++) pattern[y][x] = 'yellow';
  }
  const solvedRing: StickerColor[] = [
    'blue',
    'blue',
    'blue',
    'red',
    'red',
    'red',
    'green',
    'green',
    'green',
    'orange',
    'orange',
    'orange',
  ];
  const offset = (seed * 5 + Math.floor(seed / 4)) % solvedRing.length;
  OUTER_RING.forEach(([x, y], position) => {
    pattern[y][x] = solvedRing[(position + offset) % solvedRing.length];
  });
  return pattern;
}
