import { definePllCase } from './pll-case';

/** PLL Eのケース定義。 */
export const E_CASE = definePllCase({
  number: 'E',
  group: 'Corner',
  setup: "R' F R U R' D' U' R' D F' D' R D U R",
  algorithms: [
    {
      id: 'c80d734d-27f3-4aa4-9103-168e36b55c13',
      notation: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    },
    {
      id: '1eb9b931-c84d-449b-87cd-1a6f951949b4',
      notation: "x' R U' R' D R U R' Uw2 R' U R D R' U' R x'",
    },
    {
      id: '078401d9-baba-48d8-b22e-6a6abe61dcfb',
      notation: "y R' U' D' R' D F D' R U D R U' R' F' R",
    },
  ],
});
