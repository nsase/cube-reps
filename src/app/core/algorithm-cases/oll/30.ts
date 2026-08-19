import { defineOllCase } from './oll-case';

export const OLL_30_CASE = defineOllCase({
  number: '30',
  names: ['Anti-Spotted Chameleon'],
  group: 'Awkward Shape',
  algorithms: [
    "F R' F R2 U' R' U' R U R' F2",
    "F U (R U2 R' U') R U2 R' U' F'",
    "(U2) F U R U2 R' U' R U2 R' U' F'",
    "(U') Rw' D' Rw U' Rw' D Rw2 U' Rw' U Rw U Rw'",
    "(U2) F R' F R2 U' R' U' R U R' F2",
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
