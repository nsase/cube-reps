import { definePllCase } from './pll-case';

/** PLL Jaのケース定義。 */
export const JA_CASE = definePllCase({
  number: 'Ja',
  group: 'Mixed',
  pattern: [
    ['none', 'blue', 'green', 'green', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'red'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'orange', 'orange', 'orange', 'none'],
  ],
  algorithms: [
    { id: '9aed8b88-1e42-4d51-b55a-a150359133d0', notation: "R' U L' U2 R U' R' U2 R L U'" },
    { id: '373d8ab2-b364-473b-93bc-6da59dd740b0', notation: "(y) x R2 F R F' R U2 Rw' U Rw U2 x'" },
  ],
});
