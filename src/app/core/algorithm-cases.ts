import { AlgorithmCase, CubePattern, StickerColor } from './cube.models';
export { PLL_CASES } from './algorithm-cases/pll';

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

function blankPattern(): StickerColor[][] {
  return Array.from({ length: 5 }, () => Array<StickerColor>(5).fill('none'));
}

function createOllPattern(index: number): CubePattern {
  const pattern = blankPattern();
  for (let y = 1; y <= 3; y++) {
    for (let x = 1; x <= 3; x++) {
      const position = (y - 1) * 3 + x - 1;
      pattern[y][x] = position === 4 || ((index + 1) * (position + 3)) % 7 < 3 ? 'yellow' : 'none';
    }
  }
  OUTER_RING.forEach(([x, y], position) => {
    pattern[y][x] = ((index + 2) * (position + 1)) % 5 < 2 ? 'yellow' : 'none';
  });
  return pattern;
}

const OLL_GROUPS = [
  'Dot',
  'Line',
  'Cross',
  'Square',
  'Lightning',
  'Fish',
  'Knight',
  'Awkward',
  'Corners',
];
export const OLL_CASES: AlgorithmCase[] = Array.from({ length: 57 }, (_, index) => ({
  kind: 'OLL',
  number: String(index + 1).padStart(2, '0'),
  name: `OLL ${index + 1}`,
  group: OLL_GROUPS[index % OLL_GROUPS.length],
  algorithms:
    index === 26
      ? ["R U R' U R U2 R'", "y R U2 R' U' R U' R'"]
      : index === 20
        ? ["R U2 R' U' R U R' U' R U' R'"]
        : [],
  pattern: createOllPattern(index),
}));
