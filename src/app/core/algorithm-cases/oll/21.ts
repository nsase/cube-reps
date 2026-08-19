import { defineOllCase } from './oll-case';

export const OLL_21_CASE = defineOllCase({
  number: '21',
  names: ['H', 'Double Sune', 'Flip', 'Cross'],
  group: 'Cross',
  algorithms: [
    "R U2 R' U' R U R' U' R U' R'",
    "y R U R' U R U' R' U R U2 R'",
    "R U R' U R U' R' U R U2 R'",
    "(U) R U2 R' U' R U R' U' R U' R'",
    "U F (R U R' U')3 F'",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
  ],
});
