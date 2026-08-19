import { definePllCase } from './pll-case';

export const RA_CASE = definePllCase({
  number: 'Ra',
  group: 'Mixed',
  pattern: [
    ['none', 'orange', 'blue', 'red', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['green', 'yellow', 'yellow', 'yellow', 'orange'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['none', 'green', 'red', 'green', 'none'],
  ],
  algorithms: ["L U2 L' U2 L F' L' U' L U L F L2' U", "(y) R U' R' U' R U R D R' U' R D' R' U2 R'"],
});
