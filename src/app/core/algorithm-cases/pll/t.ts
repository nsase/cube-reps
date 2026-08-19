import { definePllCase } from './pll-case';

export const T_CASE = definePllCase({
  number: 'T',
  group: 'Mixed',
  pattern: [
    ['none', 'blue', 'blue', 'orange', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['orange', 'yellow', 'yellow', 'yellow', 'red'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'green', 'green', 'orange', 'none'],
  ],
  algorithms: ["R U R' U' R' F R2 U' R' U' R U R' F'"],
});
