import { defineOllCase } from './oll-case';

/** OLL 20のケース定義。 */
export const OLL_20_CASE = defineOllCase({
  number: '20',
  names: ['X', 'Checkers'],
  group: 'Dot',
  algorithms: [
    "Rw U R' U' M2 U R U' R' U' M'",
    "Rw' R U (R U R' U') M2 U R U' Rw'",
    "Rw' R U R U R' U' Rw R' M' U R U' Rw'",
    "Rw U R' U' Rw R' M' U R U' R' U' M'",
    "S' R U R' S U' M' U R U' Rw'",
    "M U (R U R' U') M2 (U R U' Rw')",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
