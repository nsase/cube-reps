import { definePllCase } from './pll-case';

/** PLL Rbのケース定義。 */
export const RB_CASE = definePllCase({
  number: 'Rb',
  group: 'Mixed',
  setup: "R' U2 R U2 R' F R U R' U' R' F' R2 U'",
  algorithms: [
    {
      id: '63f44649-9b58-4baa-a173-78aaaccd70a7',
      notation: "R' U2 R U2 R' F R U R' U' R' F' R2 U'",
    },
    {
      id: 'de6cedec-8f50-4bbb-912d-8d209f64d4c8',
      notation: "(y) R2 F R U R U' R' F' R U2 R' U2 R",
    },
  ],
});
