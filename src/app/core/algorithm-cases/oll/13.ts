import { defineOllCase } from './oll-case';

export const OLL_13_CASE = defineOllCase({
  number: '13',
  names: ['Gun', 'Trigger'],
  group: 'Knight Move Shape',
  algorithms: [
    "F U R U' R2 F' R U R U' R'",
    "Rw U' Rw' U' Rw U Rw' y' R' U R",
    "F U R U2 R' U' R U R' F'",
    "Rw U' Rw' U' Rw U Rw' F' U F",
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
