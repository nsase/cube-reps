import { AlgorithmCase, CubePattern, StickerColor } from '../../cube.models';

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

interface PllCaseDefinition {
  number: string;
  group: string;
  algorithms: readonly string[];
  pattern?: CubePattern;
  patternSeed?: number;
}

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
