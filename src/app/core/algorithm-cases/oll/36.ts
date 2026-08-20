import { defineOllCase } from './oll-case';

export const OLL_36_CASE = defineOllCase({
  number: '36',
  names: ['Sea-Mew', 'Wario', 'Anti-Moustache'],
  group: 'W Shape',
  algorithms: [
    "L' U' L U' L' U L U L F' L' F",
    "y2 R' U' R U' R' U R U R B' R' B",
    "R U R' F' R U R' U' R' F R U' R' F R F'",
    "R' F' U' F2 U R U' R' F' R",
    "(y') R U R2 F' U' F U R2 U2 R'",
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
