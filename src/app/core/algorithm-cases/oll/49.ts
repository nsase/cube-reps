import { defineOllCase } from './oll-case';

/** OLL 49のケース定義。 */
export const OLL_49_CASE = defineOllCase({
  number: '49',
  names: ['Right back squeezy'],
  group: 'Small L Shape',
  algorithms: [
    "Rw U' Rw2 U Rw2 U Rw2 U' Rw",
    "Rw U' Rw2 U Rw2 U Rw2 U' Rw",
    "(y2) R B' R2 F R2 B R2 F' R",
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
