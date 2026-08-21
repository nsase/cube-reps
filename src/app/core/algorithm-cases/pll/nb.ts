import { definePllCase } from './pll-case';

/** PLL Nbのケース定義。 */
export const NB_CASE = definePllCase({
  number: 'Nb',
  group: 'Mixed',
  pattern: [
    ['none', 'orange', 'red', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['none', 'orange', 'orange', 'red', 'none'],
  ],
  algorithms: [
    "R' U L' U2 R U' L R' U L' U2 R U' L U'",
    "R' U R U' R' F' U' F R U R' F R' F' R U' R",
  ],
});
