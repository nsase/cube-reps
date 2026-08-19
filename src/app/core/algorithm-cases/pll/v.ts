import { definePllCase } from './pll-case';

export const V_CASE = definePllCase({
  number: 'V',
  group: 'Mixed',
  pattern: [
    ['none', 'green', 'orange', 'blue', 'none'],
    ['orange', 'yellow', 'yellow', 'yellow', 'orange'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['red', 'yellow', 'yellow', 'yellow', 'red'],
    ['none', 'green', 'green', 'blue', 'none'],
  ],
  algorithms: ["R' U R' U' y R' F' R2 U' R' U R' F R F", "R' U R' Dw' R' F' R2 U' R' U R' F R F"],
});
