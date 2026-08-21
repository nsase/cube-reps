import { definePllCase } from './pll-case';

/** PLL Gcのケース定義。 */
export const GC_CASE = definePllCase({
  number: 'Gc',
  group: 'Mixed',
  pattern: [
    ['none', 'blue', 'orange', 'orange', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['green', 'yellow', 'yellow', 'yellow', 'red'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'green', 'blue', 'orange', 'none'],
  ],
  algorithms: ["R2 U' R U' R U R' U R2 D' U R U' R' D", "R2 Uw' R U' R U R' Uw R2 y R U' R'"],
});
