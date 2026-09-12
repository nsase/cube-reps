import { defineOllCase } from './oll-case';

/** OLL 04のケース定義。 */
export const OLL_04_CASE = defineOllCase({
  number: '04',
  names: ['Pinwheel', 'Mouse'],
  group: 'Dot',
  setup: "R' F2 R2 U2 R' F R U2 R2 F2 R U",
  algorithms: [
    { id: 'f698e2fd-96c5-4251-9b33-77a2ed8dcb11', notation: "M U' Rw U2 Rw' U' R U' R' M'" },
    {
      id: '9009f915-3c37-4ac9-b799-36b05230d4e1',
      notation: "(y) F U R U' R' F' U' F R U R' U' F'",
    },
    {
      id: 'f72804b1-6962-4369-a763-3d67d949ee4f',
      notation: "(y') Fw R U R' U' Fw' U F R U R' U' F'",
    },
    { id: '8805dc44-67a2-415a-b603-c0cd7e076af2', notation: "Lw L2 U' L U' Lw' U2 Lw U' M'" },
    { id: '9e683de8-5a16-47ac-96f4-b134cab820b7', notation: "R Rw' U' Rw U2 Rw' U' R U' R2 Rw" },
    { id: '00b91620-c923-4518-b5b6-4355e321f6fc', notation: "(y') R' F2 R2 U2 R' F' R U2 R2 F2 R" },
  ],
});
