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
  algorithms: [
    { id: '4bb99e9a-6bdd-4cd8-b47f-3c7c0c835055', notation: 'M2 U M2 U2 M2 U M2' },
    { id: 'e23359c3-5b22-46b7-a65c-2e449a664e67', notation: "M2 U' M2 U2 M2 U' M2" },
  ],
});
