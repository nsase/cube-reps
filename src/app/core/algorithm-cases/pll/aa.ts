import { definePllCase } from './pll-case';

/** PLL Aaのケース定義。 */
export const AA_CASE = definePllCase({
  number: 'Aa',
  group: 'Corner',
  setup: "R2 B2 R F R' B2 R F' R",
  pattern: [
    ['none', 'green', 'orange', 'green', 'none'],
    ['orange', 'yellow', 'yellow', 'yellow', 'red'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'red', 'red', 'orange', 'none'],
  ],
  algorithms: [
    { id: 'aea28da7-262e-4535-9431-0cca654579cc', notation: "x R' U R' D2 R U' R' D2 R2 x'" },
    { id: 'b96c55ca-b8eb-4091-b0d7-3c63aa3bb7eb', notation: "(y) x' R2 D2 R' U' R D2 R' U R' x" },
    { id: '3e5de733-385c-4331-b45b-6b702330a169', notation: "(y') x L2 D2 L' U' L D2 L' U L' x'" },
  ],
});
