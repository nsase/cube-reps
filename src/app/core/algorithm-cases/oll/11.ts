import { defineOllCase } from './oll-case';

/** OLL 11のケース定義。 */
export const OLL_11_CASE = defineOllCase({
  number: '11',
  names: ['Downstairs'],
  group: 'Small Lightning Bolt',
  setup: "L2 F2 R2 D2 B D2 B2 F L2 B' L' B' L F' R2 F2 U2",
  algorithms: [
    { id: 'f5273459-e0f0-47aa-ac04-395458222bee', notation: "Rw U R' U R' F R F' R U2 Rw'" },
    { id: '38f484df-d783-4016-a8e1-71deb5381110', notation: "(y2) Rw' R2 U R' U R U2 R' U M'" },
  ],
});
