import { defineOllCase } from './oll-case';

/** OLL 26のケース定義。 */
export const OLL_26_CASE = defineOllCase({
  number: '26',
  names: ['Antisune', 'AS', 'S-', 'Swimming Right'],
  group: 'Cross',
  algorithms: [
    "(R U2 R') U' R U' R'",
    "y' R' U' R U' R' U2 R",
    "R U2 R' U' R U' R'",
    "(y') R' U' R U' R' U2 R",
    "R U2 R' U' R U' R'",
    "(y) L' U' L U' L' U2 L",
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
  ],
});
