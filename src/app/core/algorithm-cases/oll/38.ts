import { defineOllCase } from './oll-case';

export const OLL_38_CASE = defineOllCase({
  number: '38',
  names: ['Mario', 'Moustache'],
  group: 'W Shape',
  algorithms: ["R U R' U R U' R' U' R' F R F'", "(U2) R U R' U R U' R' U' R' F R F'"],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
