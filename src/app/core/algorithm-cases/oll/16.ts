import { defineOllCase } from './oll-case';

export const OLL_16_CASE = defineOllCase({
  number: '16',
  names: ['Anti-Squeegee'],
  group: 'Knight Move Shape',
  algorithms: ["Rw U Rw' R U R' U' Rw U' Rw'", "Rw U Rw' R U R' U' Rw U' Rw'"],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
