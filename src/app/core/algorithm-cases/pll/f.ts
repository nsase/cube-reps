import { definePllCase } from './pll-case';

/** PLL Fのケース定義。 */
export const F_CASE = definePllCase({
  number: 'F',
  group: 'Mixed',
  setup: "R' U' R U' R' U R U R2 F' R U R U' R' F U R",
  algorithms: [
    {
      id: '66c85580-78ad-4333-a395-06c878f4a188',
      notation: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    },
    {
      id: '331b5b1a-df80-455b-a3f7-b1e951252e1a',
      notation: "(y) R' U2 R' Dw' R' F' R2 U' R' U R' F R U' F",
    },
  ],
});
