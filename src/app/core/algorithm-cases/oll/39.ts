import { defineOllCase } from './oll-case';

export const OLL_39_CASE = defineOllCase({
  number: '39',
  names: ['Fung'],
  group: 'Big Lightning Bolt',
  algorithms: [
    "L F' L' U' L U F U' L'",
    "y2 R B' R' U' R U B U' R'",
    "(U2) R U R' F' U' F U R U2 R'",
    "(U2) Fw' Rw U Rw' U' Rw' F Rw S",
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
