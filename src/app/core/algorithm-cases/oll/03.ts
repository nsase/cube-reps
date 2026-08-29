import { defineOllCase } from './oll-case';

/** OLL 03のケース定義。 */
export const OLL_03_CASE = defineOllCase({
  number: '03',
  names: ['Anti-Pinwheel', 'Anti-Mouse'],
  group: 'Dot',
  setup: "R' F2 R2 U2 R' F' R U2 R2 F2 R U'",
  algorithms: [
    { id: 'd74a7a9f-abdf-4cb0-8c15-23534cd274c1', notation: "Rw' R2 U R' U Rw U2 Rw' U M'" },
    { id: 'f47c153c-c799-4f18-bf63-50bcd2fde3bb', notation: "(y) F U R U' R' F' U F R U R' U' F'" },
    {
      id: '907cef71-c670-4ef2-a5d1-cd1f0baf202b',
      notation: "(y') Fw R U R' U' Fw' U' F R U R' U' F'",
    },
    { id: '0eef98cc-c12e-4f69-acff-f78429bd0e87', notation: "Rw' R2 U R' U Rw U2 Rw' U M'" },
    { id: '8e897a4d-0554-4107-a998-dcae7b1535be', notation: "L' Lw U Lw' U2 Lw U L' U L M'" },
    { id: '284b52bc-774e-4675-99f6-9282d7b068c1', notation: "(y) R' F2 R2 U2 R' F R U2 R2 F2 R" },
  ],
});
