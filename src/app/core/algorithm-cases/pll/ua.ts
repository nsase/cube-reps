import { definePllCase } from './pll-case';

/** PLL Uaのケース定義。 */
export const UA_CASE = definePllCase({
  number: 'Ua',
  group: 'Edge',
  pattern: [
    ['none', 'blue', 'blue', 'blue', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['green', 'yellow', 'yellow', 'yellow', 'red'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'orange', 'green', 'none'],
  ],
  algorithms: [
    { id: '5fdd838b-60c5-4356-b5d1-35c64188469d', notation: "R U' R U R U R U' R' U' R2" },
    { id: 'cf591a23-ea60-4657-9008-280c07b19b83', notation: "M2 U M U2 M' U M2" },
  ],
});
