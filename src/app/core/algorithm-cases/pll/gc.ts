import { definePllCase } from './pll-case';

/** PLL Gcのケース定義。 */
export const GC_CASE = definePllCase({
  number: 'Gc',
  group: 'Mixed',
  setup: "D' R U R' U' D R2 U' R U' R' U R' U R2",
  algorithms: [
    {
      id: '9a30d550-21a8-40d6-b707-396b95b0bfac',
      notation: "R2 U' R U' R U R' U R2 D' U R U' R' D",
    },
    {
      id: 'afa66d48-418c-4c17-b648-084eed38f244',
      notation: "R2 Uw' R U' R U R' Uw R2 y R U' R'",
    },
  ],
});
