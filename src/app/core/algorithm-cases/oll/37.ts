import { defineOllCase } from './oll-case';

export const OLL_37_CASE = defineOllCase({
  number: '37',
  names: ['Mounted Fish', 'Untying Shoelaces'],
  group: 'Fish Shape',
  algorithms: ["F R' F' R U R U' R'", "F R U' R' U' R U R' F'"],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
