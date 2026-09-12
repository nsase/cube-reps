import { definePllCase } from './pll-case';

/** PLL Yのケース定義。 */
export const Y_CASE = definePllCase({
  number: 'Y',
  group: 'Mixed',
  setup: "F R' F' R U R U' R' F R U' R' U R U R' F'",
  algorithms: [
    {
      id: '6c8a1780-261e-4a9e-9069-ba8a01148d43',
      notation: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    },
  ],
});
