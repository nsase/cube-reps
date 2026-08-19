import { defineOllCase } from './oll-case';

export const OLL_22_CASE = defineOllCase({
  number: '22',
  names: ['Pi', 'Bruno', 'Wheel', 'T-shirt', 'Antarctica'],
  group: 'Cross',
  algorithms: [
    "R U2 (R2 U' R2 U' R2) U2 R",
    "R U2 R2 U' R2 U' R2 U2 R",
    "Fw (R U R' U') S' (R U R' U') F'",
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
