import { definePllCase } from './pll-case';

/** PLL Jbのケース定義。 */
export const JB_CASE = definePllCase({
  number: 'Jb',
  group: 'Mixed',
  pattern: [
    ['none', 'blue', 'blue', 'orange', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'green', 'orange', 'orange', 'none'],
  ],
  algorithms: ["R U R' F' R U R' U' R' F R2 U' R' U'", "R U2 R' U' R U2 L' U R' U' L"],
});
