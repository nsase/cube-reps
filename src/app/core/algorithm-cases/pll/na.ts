import { definePllCase } from './pll-case';

/** PLL Naのケース定義。 */
export const NA_CASE = definePllCase({
  number: 'Na',
  group: 'Mixed',
  setup: "R U' L U2 R' U L' R U' L U2 R' U L'",
  pattern: [
    ['none', 'orange', 'orange', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['none', 'orange', 'red', 'red', 'none'],
  ],
  algorithms: [
    {
      id: 'f69dc97b-1fc8-4489-8023-429abdefa6c9',
      notation: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    },
    { id: '94526ba1-5d77-40bc-9273-03183a096bc0', notation: "L U' R U2 L' U R' L U' R U2 L' U R'" },
  ],
});
