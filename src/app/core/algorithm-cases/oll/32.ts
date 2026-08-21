import { defineOllCase } from './oll-case';

/** OLL 32のケース定義。 */
export const OLL_32_CASE = defineOllCase({
  number: '32',
  names: ['Anti-Couch'],
  group: 'P Shape',
  algorithms: [
    "L U F' U' L' U L F L'",
    "(y2) S R U R' U' R' F R Fw'",
    "(y2) R U B' U' R' U R B R'",
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
