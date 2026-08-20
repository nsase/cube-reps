import { defineOllCase } from './oll-case';

export const OLL_31_CASE = defineOllCase({
  number: '31',
  names: ['Couch'],
  group: 'P Shape',
  algorithms: ["R' U' F U R U' R' F' R"],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
