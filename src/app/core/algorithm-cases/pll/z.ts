import { definePllCase } from './pll-case';

/** PLL Zのケース定義。 */
export const Z_CASE = definePllCase({
  number: 'Z',
  group: 'Edge',
  setup: "F2 R2 U' F2 U R2 F2 R2 U R2 U' R2",
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
    {
      id: '5d11b092-52e1-463a-860e-1974872ef4c8',
      notation: "y R2 U R2 U' R2 F2 R2 U' F2 U R2 F2",
    },
  ],
});
