import { AlgorithmCase } from './cube.models';

const PLL_DATA = [
  ['Aa', 'Corner', "x L2 D2 L' U' L D2 L' U L' x'"],
  ['Ab', 'Corner', "x' L2 D2 L U L' D2 L U' L x"],
  ['E', 'Corner', "x' R U' R' D R U R' D' R U R' D R U' R' D' x"],
  ['F', 'Mixed', "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"],
  ['Ga', 'Mixed', "R2 U R' U R' U' R U' R2 D U' R' U R D'"],
  ['Gb', 'Mixed', "R' U' R U D' R2 U R' U R U' R U' R2 D"],
  ['Gc', 'Mixed', "R2 U' R U' R U R' U R2 D' U R U' R' D"],
  ['Gd', 'Mixed', "R U R' U' D R2 U' R U' R' U R' U R2 D'"],
  ['H', 'Edge', 'M2 U M2 U2 M2 U M2'],
  ['Ja', 'Mixed', "x R2 F R F' R U2 r' U r U2 x'"],
  ['Jb', 'Mixed', "R U R' F' R U R' U' R' F R2 U' R'"],
  ['Na', 'Mixed', "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"],
  ['Nb', 'Mixed', "R' U R U' R' F' U' F R U R' F R' F' R U' R"],
  ['Ra', 'Mixed', "R U' R' U' R U R D R' U' R D' R' U2 R'"],
  ['Rb', 'Mixed', "R2 F R U R U' R' F' R U2 R' U2 R"],
  ['T', 'Mixed', "R U R' U' R' F R2 U' R' U' R U R' F'"],
  ['Ua', 'Edge', "M2 U M U2 M' U M2"],
  ['Ub', 'Edge', "M2 U' M U2 M' U' M2"],
  ['V', 'Mixed', "R' U R' U' y R' F' R2 U' R' U R' F R F"],
  ['Y', 'Mixed', "F R U' R' U' R U R' F' R U R' U' R' F R F'"],
  ['Z', 'Edge', "M2 U M2 U M' U2 M2 U2 M' U2"],
] as const;

export const PLL_CASES: AlgorithmCase[] = PLL_DATA.map(([number, group, algorithm]) => ({
  kind: 'PLL',
  number,
  name: `${number}-perm`,
  group,
  algorithm,
}));

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
  algorithm:
    index === 26
      ? "R U R' U R U2 R'"
      : index === 20
        ? "R U2 R' U' R U R' U' R U' R'"
        : '手順を登録予定',
}));
