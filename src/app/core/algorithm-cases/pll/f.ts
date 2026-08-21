import { definePllCase } from './pll-case';

/** PLL Fのケース定義。 */
export const F_CASE = definePllCase({
  number: 'F',
  group: 'Mixed',
  pattern: [
    ['none', 'blue', 'green', 'orange', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'green', 'blue', 'orange', 'none'],
  ],
  algorithms: [
    "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    "(y) R' U2 R' Dw' R' F' R2 U' R' U R' F R U' F",
  ],
});
