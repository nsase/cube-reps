import { defineOllCase } from './oll-case';

/** OLL 40のケース定義。 */
export const OLL_40_CASE = defineOllCase({
  number: '40',
  names: ['Anti-Fung'],
  group: 'Big Lightning Bolt',
  algorithms: [{ id: 'b25d7081-db91-4305-9831-07f4dbd96212', notation: "R' F R U R' U' F' U R" }],
  pattern: [
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
