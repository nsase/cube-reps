import { definePllCase } from './pll-case';

export const V_CASE = definePllCase({
  number: 'V',
  group: 'Mixed',
  pattern: [
    ['none', 'red', 'green', 'orange', 'none'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['blue', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'red', 'red', 'orange', 'none'],
  ],
  algorithms: ["R' U R' U' y R' F' R2 U' R' U R' F R F", "R' U R' Dw' R' F' R2 U' R' U R' F R F"],
});
