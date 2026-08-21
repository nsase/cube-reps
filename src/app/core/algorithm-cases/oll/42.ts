import { defineOllCase } from './oll-case';

/** OLL 42のケース定義。 */
export const OLL_42_CASE = defineOllCase({
  number: '42',
  names: ['Lefty Awkward Fish', 'Anti-Dalmation'],
  group: 'Awkward Shape',
  algorithms: [
    "R' U' R U' R' U2 R F R U R' U' F'",
    "R' U' R U' R' U2 R U R' F' U' F U R",
    "(U) R' F R F' R' F R F' R U R' U' R U R'",
    "(U) F R' F' R U2 R' U' R2 U' R2 U2 R",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
  ],
});
