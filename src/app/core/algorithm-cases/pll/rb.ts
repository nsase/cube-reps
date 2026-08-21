import { definePllCase } from './pll-case';

/** PLL Rbのケース定義。 */
export const RB_CASE = definePllCase({
  number: 'Rb',
  group: 'Mixed',
  pattern: [
    ['none', 'orange', 'blue', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'orange', 'green', 'none'],
  ],
  algorithms: ["R' U2 R U2 R' F R U R' U' R' F' R2 U'", "(y) R2 F R U R U' R' F' R U2 R' U2 R"],
});
