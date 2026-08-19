import { defineOllCase } from './oll-case';

export const OLL_57_CASE = defineOllCase({
  number: '57',
  names: ['Mummy', 'H', 'I', 'Brick'],
  group: 'Corners Oriented',
  algorithms: ["R U R' U' M' U R U' Rw'"],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
