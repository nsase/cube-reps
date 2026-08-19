import { definePllCase } from './pll-case';

export const JA_CASE = definePllCase({
  number: 'Ja',
  group: 'Mixed',
  pattern: [
    ['none', 'blue', 'green', 'green', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'red'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'orange', 'orange', 'orange', 'none'],
  ],
  algorithms: ["R' U L' U2 R U' R' U2 R L U'", "(y) x R2 F R F' R U2 Rw' U Rw U2 x'"],
});
