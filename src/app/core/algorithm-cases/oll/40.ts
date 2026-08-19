import { defineOllCase } from './oll-case';

export const OLL_40_CASE = defineOllCase({
  number: '40',
  names: ['Anti-Fung'],
  group: 'Big Lightning Bolt',
  algorithms: ["R' F R U R' U' F' U R"],
  pattern: [
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
