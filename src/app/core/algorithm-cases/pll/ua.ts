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
  algorithms: ["R U' R U R U R U' R' U' R2", "M2 U M U2 M' U M2"],
});
