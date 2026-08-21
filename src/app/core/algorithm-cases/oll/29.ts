import { defineOllCase } from './oll-case';

/** OLL 29のケース定義。 */
export const OLL_29_CASE = defineOllCase({
  number: '29',
  names: ['Spotted Chameleon'],
  group: 'Awkward Shape',
  algorithms: [
    "R U R' U' R U' R' F' U' F R U R'",
    "R U R' U' R' F R F' R U R' U' M' U R U' Rw'",
    "(y') Rw2 D' Rw U Rw' D Rw2 U' Rw' U' Rw",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
