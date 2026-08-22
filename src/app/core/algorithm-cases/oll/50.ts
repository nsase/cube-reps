import { defineOllCase } from './oll-case';

/** OLL 50のケース定義。 */
export const OLL_50_CASE = defineOllCase({
  number: '50',
  names: ['Right front squeezy'],
  group: 'Small L Shape',
  algorithms: ["Rw' U Rw2 U' Rw2 U' Rw2 U Rw'", "(y2) R' F R2 B' R2 F' R2 B R'"],
  pattern: [
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
