import { defineOllCase } from './oll-case';

export const OLL_19_CASE = defineOllCase({
  number: '19',
  names: ['Bunny'],
  group: 'Dot',
  algorithms: [
    "Rw' R U R U R' U' M' R' F R F'",
    "S' R U R' S U' R' F R F'",
    "(U') Rw' R U R U R' U' Rw R2 F R F'",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
