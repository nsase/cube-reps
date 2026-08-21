import { definePllCase } from './pll-case';

/** PLL Abのケース定義。 */
export const AB_CASE = definePllCase({
  number: 'Ab',
  group: 'Corner',
  pattern: [
    ['none', 'orange', 'orange', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'red', 'green', 'none'],
  ],
  algorithms: [
    "x' R U' R D2 R' U R D2 R2 x",
    "(y') x R2 D2 R U R' D2 R U' R x'",
    "(y) x' L2 D2 L U L' D2 L U' L x",
  ],
});
