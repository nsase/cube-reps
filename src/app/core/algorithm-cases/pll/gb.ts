import { definePllCase } from './pll-case';

/** PLL Gbのケース定義。 */
export const GB_CASE = definePllCase({
  number: 'Gb',
  group: 'Mixed',
  setup: "D' R2 U R' U R' U' R U' R2 D U' R' U R",
  pattern: [
    ['none', 'blue', 'red', 'orange', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['orange', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'green', 'blue', 'orange', 'none'],
  ],
  algorithms: [
    {
      id: '1d4f3f0b-a52f-4ef6-a8b3-1243af4e44ff',
      notation: "R' U' R U D' R2 U R' U R U' R U' R2 D",
    },
    { id: '5bb73f61-da45-4710-857d-d431c8a77f05', notation: "R' U' R y R2 Uw R' U R U' R Uw' R2" },
  ],
});
