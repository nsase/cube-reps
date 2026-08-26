import { definePllCase } from './pll-case';

/** PLL Yのケース定義。 */
export const Y_CASE = definePllCase({
  number: 'Y',
  group: 'Mixed',
  pattern: [
    ['none', 'green', 'red', 'blue', 'none'],
    ['orange', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'orange'],
    ['red', 'yellow', 'yellow', 'yellow', 'red'],
    ['none', 'green', 'green', 'blue', 'none'],
  ],
  algorithms: [
    {
      id: '6c8a1780-261e-4a9e-9069-ba8a01148d43',
      notation: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    },
  ],
});
