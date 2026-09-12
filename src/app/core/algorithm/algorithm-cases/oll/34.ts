import { defineOllCase } from './oll-case';

/** OLL 34のケース定義。 */
export const OLL_34_CASE = defineOllCase({
  number: '34',
  names: ['City (C and T)'],
  group: 'C Shape',
  setup: "B' F R' F' R B U R U' R'",
  algorithms: [
    { id: '4f0498cc-240d-4e02-bac1-b19248fec84e', notation: "R U R2 U' R' F R U R U' F'" },
    { id: '08e1c0b8-ad63-4c83-bea2-a8b99692c487', notation: "R U R' U' B' R' F R F' B" },
    { id: '65386ae0-4a3e-4f7e-b1de-a4598fb1cec5', notation: "R U R' U' y Lw' U' L U L' Lw" },
    { id: 'c655843b-705a-4abb-85a4-cf1c342c8252', notation: "(y') Fw R Fw' U' Rw' U' R U M'" },
  ],
});
