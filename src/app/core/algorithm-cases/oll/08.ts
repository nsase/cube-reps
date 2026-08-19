import { defineOllCase } from './oll-case';

export const OLL_08_CASE = defineOllCase({
  number: '08',
  names: ['Wide Left Sune', 'Reverse Lightning'],
  group: 'Small Lightning Bolt',
  algorithms: [
    "Lw' U' L U' L' U2 Lw",
    "R U2 R' U2 R' F R F'",
    "y2 Rw' U' R U' R' U2 Rw",
    "(U2) Rw' U' R U' R' U2 Rw",
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
