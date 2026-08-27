import { definePllCase } from './pll-case';

/** PLL Nbのケース定義。 */
export const NB_CASE = definePllCase({
  number: 'Nb',
  group: 'Mixed',
  setup: "U L' U R' U2 L U' R L' U R' U2 L U' R",
  pattern: [
    ['none', 'orange', 'red', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['none', 'orange', 'orange', 'red', 'none'],
  ],
  algorithms: [
    {
      id: '2282922a-6c78-4a33-87d0-7ddd27812a87',
      notation: "R' U L' U2 R U' L R' U L' U2 R U' L U'",
    },
    {
      id: '62cd32f4-d88c-4202-8f49-aebb9a7aef2e',
      notation: "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    },
  ],
});
