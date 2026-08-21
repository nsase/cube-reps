import { definePllCase } from './pll-case';

/** PLL Gbのケース定義。 */
export const GB_CASE = definePllCase({
  number: 'Gb',
  group: 'Mixed',
  pattern: [
    ['none', 'blue', 'red', 'orange', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['orange', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'green', 'blue', 'orange', 'none'],
  ],
  algorithms: ["R' U' R U D' R2 U R' U R U' R U' R2 D", "R' U' R y R2 Uw R' U R U' R Uw' R2"],
});
