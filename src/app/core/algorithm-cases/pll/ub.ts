import { definePllCase } from './pll-case';

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
  algorithms: ["R2 U R U R' U' R' U' R' U R'", "M2 U' M U2 M' U' M2"],
});
