import { defineOllCase } from './oll-case';

export const OLL_15_CASE = defineOllCase({
  number: '15',
  names: ['Squeegee'],
  group: 'Knight Move Shape',
  algorithms: ["Lw' U' Lw L' U' L U Lw' U Lw", "(y2) Rw' U' Rw R' U' R U Rw' U Rw"],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
