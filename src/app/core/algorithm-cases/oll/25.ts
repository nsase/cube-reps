import { defineOllCase } from './oll-case';

export const OLL_25_CASE = defineOllCase({
  number: '25',
  names: ['L', 'Bowtie', 'Triple-Sune', 'Side-winder', 'Diagonals', 'Spaceship'],
  group: 'Cross',
  algorithms: [
    "F' Rw U R' U' Rw' F R",
    "y' R' F R B' R' F' R B",
    "(y') F R' F' Rw U R U' Rw'",
    "F' Rw U R' U' Rw' F R",
    "(y) (F R B R') (F' R B' R')",
    "(y) (F Lw U Lw') (F' Lw U' Lw')",
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
