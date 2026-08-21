import { defineOllCase } from './oll-case';

/** OLL 05のケース定義。 */
export const OLL_05_CASE = defineOllCase({
  number: '05',
  names: ['Right back wide antisune (RBWAS)', 'Lefty Square'],
  group: 'Square Shape',
  algorithms: ["Lw' U2 L U L' U Lw", "(y2) Rw' U2 R U R' U Rw"],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
