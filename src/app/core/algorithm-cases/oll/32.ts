import { defineOllCase } from './oll-case';

export const OLL_32_CASE = defineOllCase({
  number: '32',
  names: ['Anti-Couch'],
  group: 'P Shape',
  algorithms: [
    "L U F' U' L' U L F L'",
    "y2 S R U R' U' R' F R Fw'",
    "S R U R' U' R' F R Fw'",
    "(U2) L U F' U' L' U L F L'",
    "R U B' U' R' U R B R'",
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
