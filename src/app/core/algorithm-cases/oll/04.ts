import { defineOllCase } from './oll-case';

export const OLL_04_CASE = defineOllCase({
  number: '04',
  names: ['Pinwheel', 'Mouse'],
  group: 'Dot',
  algorithms: [
    "M U' Rw U2 Rw' U' R U' R' M'",
    "y F U R U' R' F' U' F R U R' U' F'",
    "y' Fw R U R' U' Fw' U F R U R' U' F'",
    "Fw R U R' U' Fw' U F R U R' U' F'",
    "(U) Lw L2 U' L U' Lw' U2 Lw U' M'",
    "(U) R Rw' U' Rw U2 Rw' U' R U' R2 Rw",
    "R' F2 R2 U2 R' F' R U2 R2 F2 R",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
