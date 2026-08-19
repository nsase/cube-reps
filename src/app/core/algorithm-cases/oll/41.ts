import { defineOllCase } from './oll-case';

export const OLL_41_CASE = defineOllCase({
  number: '41',
  names: ['Awkward Fish', 'Dalmation'],
  group: 'Awkward Shape',
  algorithms: ["R U R' U R U2 R' F R U R' U' F'", "(U2) R U R' U R U2 R' F R U R' U' F'"],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
