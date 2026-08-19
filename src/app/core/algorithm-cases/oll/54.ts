import { defineOllCase } from './oll-case';

export const OLL_54_CASE = defineOllCase({
  number: '54',
  names: ['Anti-Frying Pan'],
  group: 'Small L Shape',
  algorithms: [
    "(Rw U2 R' U') R U R' U' R U' Rw'",
    "y Rw U R' U R U' R' U R U2 Rw'",
    "Rw U R' U R U' R' U R U2 Rw'",
    "(U') Rw U2 R' U' R U R' U' R U' Rw'",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
  ],
});
