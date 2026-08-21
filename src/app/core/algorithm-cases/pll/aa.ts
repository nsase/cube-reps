import { definePllCase } from './pll-case';

/** PLL Aaのケース定義。 */
export const AA_CASE = definePllCase({
  number: 'Aa',
  group: 'Corner',
  pattern: [
    ['none', 'green', 'orange', 'green', 'none'],
    ['orange', 'yellow', 'yellow', 'yellow', 'red'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'red', 'red', 'orange', 'none'],
  ],
  algorithms: [
    "x R' U R' D2 R U' R' D2 R2 x'",
    "(y) x' R2 D2 R' U' R D2 R' U R' x",
    "(y') x L2 D2 L' U' L D2 L' U L' x'",
  ],
});
