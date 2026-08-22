import { defineOllCase } from './oll-case';

/** OLL 18のケース定義。 */
export const OLL_18_CASE = defineOllCase({
  number: '18',
  names: ['Crown'],
  group: 'Dot',
  algorithms: [
    "Rw U R' U R U2 Rw' Rw' U' R U' R' U2 Rw",
    "(y) R U2 R' R' F R F' U2 M' (U R U' Rw')",
    "(y) R U2 R2 F R F' U2 M' U R U' Rw'",
    "(y2) R U R2 F' U' F U R U2 R' F R F'",
    "(y2) F R U R' Dw R' U2 (R' F R F')",
    "Rw U R' U R U2 Rw2 U' R U' R' U2 Rw",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
  ],
});
