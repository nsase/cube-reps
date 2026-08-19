import { defineOllCase } from './oll-case';

export const OLL_55_CASE = defineOllCase({
  number: '55',
  names: ['Highway', 'Freeway'],
  group: 'I Shape',
  algorithms: [
    "R' F R U R U' R2 F' R2 U' R' U R U R'",
    "y R U2 R2 U' R U' R' U2 F R F'",
    "(U) R' F R U R U' R2 F' R2 U' R' U R U R'",
    "(U) R' F U R U' R2 F' R2 U R' U' R",
    "(U) Rw U2 R' U' Rw' R2 U R' U' Rw U' Rw'",
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
  ],
});
