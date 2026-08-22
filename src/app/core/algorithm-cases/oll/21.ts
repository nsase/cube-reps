import { defineOllCase } from './oll-case';

/** OLL 21のケース定義。 */
export const OLL_21_CASE = defineOllCase({
  number: '21',
  names: ['H', 'Double Sune', 'Flip', 'Cross'],
  group: 'Cross',
  algorithms: [
    "R U2 R' U' R U R' U' R U' R'",
    "(y) R U R' U R U' R' U R U2 R'",
    "(y2) R U2 R' U' R U R' U' R U' R'",
    "(y) U F (R U R' U')3 F'",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
  ],
});
