import { definePllCase } from './pll-case';

/** PLL Eのケース定義。 */
export const E_CASE = definePllCase({
  number: 'E',
  group: 'Corner',
  pattern: [
    ['none', 'red', 'blue', 'orange', 'none'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'red', 'green', 'orange', 'none'],
  ],
  algorithms: [
    {
      id: 'c80d734d-27f3-4aa4-9103-168e36b55c13',
      notation: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    },
    {
      id: '1eb9b931-c84d-449b-87cd-1a6f951949b4',
      notation: "x' R U' R' D R U R' Uw2 R' U R D R' U' R x'",
    },
  ],
});
