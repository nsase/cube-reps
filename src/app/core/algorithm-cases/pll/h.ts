import { definePllCase } from './pll-case';

/** PLL Hのケース定義。 */
export const H_CASE = definePllCase({
  number: 'H',
  group: 'Edge',
  pattern: [
    ['none', 'blue', 'green', 'blue', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['orange', 'yellow', 'yellow', 'yellow', 'red'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'blue', 'green', 'none'],
  ],
  algorithms: ['M2 U M2 U2 M2 U M2', "M2 U' M2 U2 M2 U' M2"],
});
