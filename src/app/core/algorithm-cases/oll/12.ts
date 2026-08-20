import { defineOllCase } from './oll-case';

export const OLL_12_CASE = defineOllCase({
  number: '12',
  names: ['Upstairs'],
  group: 'Small Lightning Bolt',
  algorithms: [
    "M' R' U' R U' R' U2 R U' R Rw'",
    "Rw R2 U' R U' R' U2 R U' Rw' R",
    "(y2) Lw L2 U' L U' L' U2 L U' M'",
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
