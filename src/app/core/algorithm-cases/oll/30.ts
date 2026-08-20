import { defineOllCase } from './oll-case';

export const OLL_30_CASE = defineOllCase({
  number: '30',
  names: ['Anti-Spotted Chameleon'],
  group: 'Awkward Shape',
  algorithms: [
    "F R' F R2 U' R' U' R U R' F2",
    "F U (R U2 R' U') R U2 R' U' F'",
    "F U R U2 R' U' R U2 R' U' F'",
    "(y) Rw' D' Rw U' Rw' D Rw2 U' Rw' U Rw U Rw'",
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
