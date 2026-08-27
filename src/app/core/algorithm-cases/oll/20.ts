import { defineOllCase } from './oll-case';

/** OLL 20のケース定義。 */
export const OLL_20_CASE = defineOllCase({
  number: '20',
  names: ['X', 'Checkers'],
  group: 'Dot',
  setup: "F' L F L' U F2 U R U' R2 F' R F'",
  algorithms: [
    { id: '450e0068-6dbf-441b-bb5b-bbe4c2f22c8c', notation: "Rw U R' U' M2 U R U' R' U' M'" },
    { id: 'f3f44fd8-cd90-47d3-a5ba-78742f4005b9', notation: "Rw' R U R U R' U' M2 U R U' Rw'" },
    { id: 'ca5adc14-756d-4bc2-b319-338b7727612f', notation: "S' R U R' S U' M' U R U' Rw'" },
    { id: '3f61b4d4-2f02-43d4-aeb4-1f825c0d186b', notation: "M U R U R' U' M2 U R U' Rw'" },
    { id: 'c6feb421-e061-4d3d-a64f-1323d0740ec4', notation: "R U' R2 F2 U' R F R' U F2 R2 U R'" },
    { id: '257258e7-efba-47cd-976d-a8360cb4d5c3', notation: "F R' F R2 U R' U' F2 U' L F' L' F" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
