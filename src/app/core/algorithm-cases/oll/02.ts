import { defineOllCase } from './oll-case';

/** OLL 02のケース定義。 */
export const OLL_02_CASE = defineOllCase({
  number: '02',
  names: ['Zamboni'],
  group: 'Dot',
  algorithms: [
    "Rw U Rw' U2 Rw U2 R' U2 R U' Rw'",
    "(y') F R U R' U' F' Fw R U R' U' Fw'",
    "(y') F R U R' U' S R U R' U' Fw'",
    "(y2) R U' R2 D' Rw U Rw' D R2 U R'",
    "(y) Fw U R U' R' S' U R U' R' F'",
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
