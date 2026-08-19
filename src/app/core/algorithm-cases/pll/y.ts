import { definePllCase } from './pll-case';

export const Y_CASE = definePllCase({
  number: 'Y',
  group: 'Mixed',
  pattern: [
    ['none', 'green', 'red', 'blue', 'none'],
    ['orange', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'orange'],
    ['red', 'yellow', 'yellow', 'yellow', 'red'],
    ['none', 'green', 'green', 'blue', 'none'],
  ],
  algorithms: ["F R U' R' U' R U R' F' R U R' U' R' F R F'"],
});
