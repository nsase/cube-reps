import { definePllCase } from './pll-case';

/** PLL Ubのケース定義。 */
export const UB_CASE = definePllCase({
  number: 'Ub',
  group: 'Edge',
  pattern: [
    ['none', 'blue', 'blue', 'blue', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['orange', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'red', 'green', 'none'],
  ],
  algorithms: [
    { id: '78e4863c-9d56-48d5-853b-18d7707c03e9', notation: "R2 U R U R' U' R' U' R' U R'" },
    { id: '2760afe5-2ef2-4598-8aeb-77670b3b9c97', notation: "M2 U' M U2 M' U' M2" },
  ],
});
