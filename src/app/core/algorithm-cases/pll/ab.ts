import { definePllCase } from './pll-case';

/** PLL Abのケース定義。 */
export const AB_CASE = definePllCase({
  number: 'Ab',
  group: 'Corner',
  setup: "R2 F2 R' B' R F2 R' B R'",
  pattern: [
    ['none', 'orange', 'orange', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'red', 'green', 'none'],
  ],
  algorithms: [
    { id: '2fbfe7c1-8aa6-40b3-94d9-36daae344aaa', notation: "x' R U' R D2 R' U R D2 R2 x" },
    { id: '4ad04d1c-b9cd-4854-b8f0-7d260748ff80', notation: "(y') x R2 D2 R U R' D2 R U' R x'" },
    { id: '451ac674-1616-465d-960c-6abe95db8a99', notation: "(y) x' L2 D2 L U L' D2 L U' L x" },
  ],
});
