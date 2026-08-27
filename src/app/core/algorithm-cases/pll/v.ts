import { definePllCase } from './pll-case';

/** PLL Vのケース定義。 */
export const V_CASE = definePllCase({
  number: 'V',
  group: 'Mixed',
  setup: "R' B' R' B U' B U B2 R B U R U' R",
  pattern: [
    ['none', 'red', 'green', 'orange', 'none'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['blue', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'red', 'red', 'orange', 'none'],
  ],
  algorithms: [
    {
      id: '567e7908-4980-455f-9b4d-19c5213203cd',
      notation: "R' U R' U' y R' F' R2 U' R' U R' F R F",
    },
    {
      id: '755929d6-e63b-4062-b896-6dccad63c62e',
      notation: "R' U R' Dw' R' F' R2 U' R' U R' F R F",
    },
  ],
});
