import { definePllCase } from './pll-case';

/** PLL Tのケース定義。 */
export const T_CASE = definePllCase({
  number: 'T',
  group: 'Mixed',
  setup: "F R U' R' U R U R2 F' R U R U' R'",
  algorithms: [
    {
      id: 'fb7cc939-d423-497e-b251-1a8e3a657d35',
      notation: "R U R' U' R' F R2 U' R' U' R U R' F'",
    },
  ],
});
