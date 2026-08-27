import { defineOllCase } from './oll-case';

/** OLL 05のケース定義。 */
export const OLL_05_CASE = defineOllCase({
  number: '05',
  names: ['Right back wide antisune (RBWAS)', 'Lefty Square'],
  group: 'Square Shape',
  setup: "R' F' L F' L' F2 R",
  algorithms: [
    { id: 'd2cb390c-c205-4473-afe1-1f46833e72e8', notation: "Lw' U2 L U L' U Lw" },
    { id: '7f4dd9bc-cf2f-4513-be33-b7973614d3a9', notation: "(y2) Rw' U2 R U R' U Rw" },
    { id: '7a850518-3af8-484c-8ab5-acba0867fedc', notation: "R' F2 L F L' F R" },
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
