import { definePllCase } from './pll-case';

export const NA_CASE = definePllCase({
  number: 'Na',
  group: 'Mixed',
  pattern: [
    ['none', 'orange', 'orange', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['none', 'orange', 'red', 'red', 'none'],
  ],
  algorithms: [
    "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    "L U' R U2 L' U R' L U' R U2 L' U R'",
  ],
});
