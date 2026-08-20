import { defineOllCase } from './oll-case';

export const OLL_44_CASE = defineOllCase({
  number: '44',
  names: ['P'],
  group: 'P Shape',
  algorithms: [
    "F U R U' R' F'",
    "y2 Fw R U R' U' Fw'",
    "F (U R U' R') F'",
    "(y2) Fw (R U R' U') Fw'",
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
