import { definePllCase } from './pll-case';

/** PLL Zのケース定義。 */
export const Z_CASE = definePllCase({
  number: 'Z',
  group: 'Edge',
  pattern: [
    ['none', 'blue', 'red', 'blue', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'orange', 'green', 'none'],
  ],
  algorithms: ["M2 U M2 U M' U2 M2 U2 M' U2", "M' U' M2' U' M2' U' M' U2 M2' U"],
});
