import { definePllCase } from './pll-case';

/** PLL Gdのケース定義。 */
export const GD_CASE = definePllCase({
  number: 'Gd',
  group: 'Mixed',
  setup: "D R2 U' R U' R U R' U R2 D' U R U' R'",
  algorithms: [
    {
      id: '36a63a83-e563-4908-8cc3-d4c0784a1ef1',
      notation: "R U R' U' D R2 U' R U' R' U R' U R2 D'",
    },
    {
      id: '6bb35e6b-5df1-45fe-9413-88a0fbdf9ddf',
      notation: "R U R' y' R2 Uw' R U' R' U R' Uw R2 U'",
    },
  ],
});
