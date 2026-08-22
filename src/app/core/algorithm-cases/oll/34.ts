import { defineOllCase } from './oll-case';

/** OLL 34のケース定義。 */
export const OLL_34_CASE = defineOllCase({
  number: '34',
  names: ['City (C and T)'],
  group: 'C Shape',
  algorithms: [
    "R U R2 U' R' F R U R U' F'",
    "R U R' U' B' R' F R F' B",
    "R U R' U' y Lw' U' L U L' Lw",
    "(y') Fw R Fw' U' Rw' U' R U M'",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
