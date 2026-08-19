import { defineOllCase } from './oll-case';

export const OLL_07_CASE = defineOllCase({
  number: '07',
  names: ['Lightning', 'Wide Sune'],
  group: 'Small Lightning Bolt',
  algorithms: ["Rw U R' U R U2 Rw'"],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
