import { definePllCase } from './pll-case';

/** PLL Gaのケース定義。 */
export const GA_CASE = definePllCase({
  number: 'Ga',
  group: 'Mixed',
  pattern: [
    ['none', 'green', 'blue', 'red', 'none'],
    ['orange', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'orange'],
    ['orange', 'yellow', 'yellow', 'yellow', 'green'],
    ['none', 'blue', 'red', 'red', 'none'],
  ],
  algorithms: [
    {
      id: 'eb200c8e-8e20-4615-9959-94fb9572eef8',
      notation: "R2 U R' U R' U' R U' R2 D U' R' U R D'",
    },
    { id: 'b14d099e-9771-4f4a-9be1-e84bb052eff4', notation: "R2 Uw R' U R' U' R Uw' R2 y' R' U R" },
  ],
});
