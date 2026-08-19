import { defineOllCase } from './oll-case';

export const OLL_06_CASE = defineOllCase({
  number: '06',
  names: ['Right front wide antisune (RFWAS)', 'Righty Square'],
  group: 'Square Shape',
  algorithms: ["Rw U2 R' U' R U' Rw'", "(U2) Rw U2 R' U' R U' Rw'"],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
