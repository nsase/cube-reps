import { definePllCase } from './pll-case';

/** PLL Zのケース定義。 */
export const Z_CASE = definePllCase({
  number: 'Z',
  group: 'Edge',
  pattern: [
    ['none', 'blue', 'red', 'blue', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'orange', 'green', 'none'],
  ],
  algorithms: [
    { id: '62e778d1-ad4f-4ca1-bd66-19afbc687c3c', notation: "M2 U M2 U M' U2 M2 U2 M' U2" },
    { id: '6350ab6d-e1f6-4b05-81a0-73174058857c', notation: "M' U' M2' U' M2' U' M' U2 M2' U" },
  ],
});
