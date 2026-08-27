import { definePllCase } from './pll-case';

/** PLL Jbのケース定義。 */
export const JB_CASE = definePllCase({
  number: 'Jb',
  group: 'Mixed',
  setup: "L' U R U' L U2 R' U R U2 R'",
  pattern: [
    ['none', 'blue', 'blue', 'orange', 'none'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'green'],
    ['red', 'yellow', 'yellow', 'yellow', 'blue'],
    ['none', 'green', 'orange', 'orange', 'none'],
  ],
  algorithms: [
    {
      id: 'ae618e98-e934-4d65-aa19-d7bda58cf947',
      notation: "R U R' F' R U R' U' R' F R2 U' R' U'",
    },
    { id: '0ecba8e0-cd8f-4e43-8d2c-8a137c708337', notation: "R U2 R' U' R U2 L' U R' U' L" },
  ],
});
