import { defineOllCase } from './oll-case';

/** OLL 17のケース定義。 */
export const OLL_17_CASE = defineOllCase({
  number: '17',
  names: ['Slash', 'Diagonal'],
  group: 'Dot',
  algorithms: [
    "F R' F' R2 Rw' U R U' R' U' M'",
    "(y2) R U R' U R' F R F' U2 R' F R F'",
    "F R' F' R U S' R U' R' S",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
