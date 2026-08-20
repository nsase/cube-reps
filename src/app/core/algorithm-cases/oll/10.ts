import { defineOllCase } from './oll-case';

export const OLL_10_CASE = defineOllCase({
  number: '10',
  names: ['Anti-Kite'],
  group: 'Fish Shape',
  algorithms: [
    "R U R' U R' F R F' R U2 R'",
    "(y2) Rw U R' U R U' R' U' Rw' R (U R U' R')",
    "(y) F U F' R' F R U' R' F' R",
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
