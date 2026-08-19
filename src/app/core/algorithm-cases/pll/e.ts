import { definePllCase } from './pll-case';

export const E_CASE = definePllCase({
  number: 'E',
  group: 'Corner',
  pattern: [
    ['none', 'red', 'blue', 'orange', 'none'],
    ['green', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'orange'],
    ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'red', 'green', 'orange', 'none'],
  ],
  algorithms: [
    "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    "x' R U' R' D R U R' Uw2 R' U R D R' U' R x'",
  ],
});
