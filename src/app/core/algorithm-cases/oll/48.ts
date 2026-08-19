import { defineOllCase } from './oll-case';

export const OLL_48_CASE = defineOllCase({
  number: '48',
  names: ['Breakneck'],
  group: 'Small L Shape',
  algorithms: ["F R U R' U' R U R' U' F'"],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
