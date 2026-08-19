import { defineOllCase } from './oll-case';

export const OLL_56_CASE = defineOllCase({
  number: '56',
  names: ['Streetlights', 'Dead Man'],
  group: 'I Shape',
  algorithms: [
    "(Rw' U' Rw) U' R' U R U' R' U R Rw' U Rw",
    "(Rw U Rw') U R U' R' U R U' R' (Rw U' Rw')",
    "(Rw U Rw') U R U' R' U R U' M' U' Rw'",
    "Rw U Rw' U R U' R' U R U' R' Rw U' Rw'",
    "Rw U Rw' U R U' R' M' U R U2 Rw'",
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
