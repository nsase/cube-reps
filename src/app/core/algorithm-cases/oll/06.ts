import { defineOllCase } from './oll-case';

/** OLL 06のケース定義。 */
export const OLL_06_CASE = defineOllCase({
  number: '06',
  names: ['Right front wide antisune (RFWAS)', 'Righty Square'],
  group: 'Square Shape',
  setup: "F U' R2 D R' U R D' R2 U F'",
  algorithms: [
    { id: '3a7ea1ba-d4e6-4811-bbe5-023c655d3a58', notation: "Rw U2 R' U' R U' Rw'" },
    { id: 'b8b671e3-9b3b-4ff5-b538-c699cf791691', notation: "F U' R2 D R' U' R D' R2 U F'" },
  ],
});
