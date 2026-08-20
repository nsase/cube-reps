import { defineOllCase } from './oll-case';

export const OLL_09_CASE = defineOllCase({
  number: '09',
  names: ['Kite'],
  group: 'Fish Shape',
  algorithms: ["R U R' U' R' F R2 U R' U' F'"],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
