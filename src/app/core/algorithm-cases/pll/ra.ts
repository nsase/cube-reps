import { definePllCase } from './pll-case';

/** PLL Raのケース定義。 */
export const RA_CASE = definePllCase({
  number: 'Ra',
  group: 'Mixed',
  pattern: [
    ['none', 'orange', 'blue', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'orange'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'red', 'green', 'none'],
  ],
  algorithms: [
    { id: '8d455d1a-3498-40be-b4e7-2df366506882', notation: "L U2 L' U2 L F' L' U' L U L F L2' U" },
    {
      id: '24787cc0-9911-4d6a-ac9d-1cbf8c91048d',
      notation: "(y) R U' R' U' R U R D R' U' R D' R' U2 R'",
    },
  ],
});
