import { defineOllCase } from './oll-case';

export const OLL_11_CASE = defineOllCase({
  number: '11',
  names: ['Downstairs'],
  group: 'Small Lightning Bolt',
  algorithms: ["Rw U R' U R' F R F' R U2 Rw'", "(y2) Rw' R2 U R' U R U2 R' U M'"],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
