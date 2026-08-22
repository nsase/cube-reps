import { defineOllCase } from './oll-case';

/** OLL 52のケース定義。 */
export const OLL_52_CASE = defineOllCase({
  number: '52',
  names: ['Rice Cooker'],
  group: 'I Shape',
  algorithms: [
    "R U R' U R U' B U' B' R'",
    "(y2) R' F' U' F U' (R U R' U) R",
    "R U R' U R U' y R U' R' F'",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
  ],
});
