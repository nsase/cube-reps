import { defineOllCase } from './oll-case';

/** OLL 03のケース定義。 */
export const OLL_03_CASE = defineOllCase({
  number: '03',
  names: ['Anti-Pinwheel', 'Anti-Mouse'],
  group: 'Dot',
  algorithms: [
    "Rw' R2 U R' U Rw U2 Rw' U M'",
    "y F U R U' R' F' U F R U R' U' F'",
    "y' Fw R U R' U' Fw' U' F R U R' U' F'",
    "(U') Fw (R U R' U') Fw' U' F (R U R' U') F'",
    "Rw' R2 U R' U Rw U2 Rw' U M'",
    "L' Lw U Lw' U2 Lw U L' U L M'",
    "(U) R' F2 R2 U2 R' F R U2 R2 F2 R",
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
