import { defineOllCase } from './oll-case';

/** OLL 19のケース定義。 */
export const OLL_19_CASE = defineOllCase({
  number: '19',
  names: ['Bunny'],
  group: 'Dot',
  algorithms: [
    "Rw' R U R U R' U' M' R' F R F'",
    "Rw' R U R U R' U' Rw R2 F R F'",
    "(y) S' R U R' S U' R' F R F'",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
