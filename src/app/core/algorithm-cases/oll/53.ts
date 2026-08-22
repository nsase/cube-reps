import { defineOllCase } from './oll-case';

/** OLL 53のケース定義。 */
export const OLL_53_CASE = defineOllCase({
  number: '53',
  names: ['Frying Pan'],
  group: 'Small L Shape',
  algorithms: [
    "Lw' U2 L U L' U' L U L' U Lw",
    "(y2) Rw' U2 (R U R' U') R U R' U Rw",
    "(y) Rw' U' R U' R' U R U' R' U2 Rw",
    "(y') Lw' U' L U' L' U L U' L' U2 Lw",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
  ],
});
