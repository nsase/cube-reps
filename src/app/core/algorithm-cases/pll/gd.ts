import { definePllCase } from './pll-case';

/** PLL Gdのケース定義。 */
export const GD_CASE = definePllCase({
  number: 'Gd',
  group: 'Mixed',
  pattern: [
    ['none', 'green', 'blue', 'red', 'none'],
    ['orange', 'yellow', 'yellow', 'yellow', 'blue'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['orange', 'yellow', 'yellow', 'yellow', 'green'],
    ['none', 'blue', 'orange', 'red', 'none'],
  ],
  algorithms: ["R U R' U' D R2 U' R U' R' U R' U R2 D'", "R U R' y' R2 Uw' R U' R' U R' Uw R2"],
});
