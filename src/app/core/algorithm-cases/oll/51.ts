import { defineOllCase } from './oll-case';

export const OLL_51_CASE = defineOllCase({
  number: '51',
  names: ['Bottlecap', 'Ant'],
  group: 'I Shape',
  algorithms: [
    "F U R U' R' U R U' R' F'",
    "y2 Fw R U R' U' R U R' U' Fw'",
    "(U2) Fw R U R' U' R U R' U' Fw'",
    "(U) R' U' R' F R F' R U2 R' U2 R",
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
