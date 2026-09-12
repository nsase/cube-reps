import { defineOllCase } from './oll-case';

/** OLL 28のケース定義。 */
export const OLL_28_CASE = defineOllCase({
  number: '28',
  names: ['Stealth', 'Arrow', 'Arrowhead', 'Fish'],
  group: 'Corners Oriented',
  setup: "B L2 B' D2 L2 R2 U2 F' R2 U2 B2 R' F2 U2 F2 R B U2",
  algorithms: [
    { id: '068e2fcf-6500-468d-ad01-8ca3649b1878', notation: "Rw U R' U' Rw' R U R U' R'" },
    { id: '854ae8f7-4e36-4da8-bb61-519eb95db6f5', notation: "(y2) M' U Lw L' U2 M' U Lw L'" },
    { id: '1d2cc119-4c68-49f4-8ef5-f4eac7086346', notation: "(y2) M' U M U2 M' U M" },
  ],
});
