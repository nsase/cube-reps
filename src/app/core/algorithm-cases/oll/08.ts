import { defineOllCase } from './oll-case';

/** OLL 08のケース定義。 */
export const OLL_08_CASE = defineOllCase({
  number: '08',
  names: ['Wide Left Sune', 'Reverse Lightning'],
  group: 'Small Lightning Bolt',
  algorithms: ["Lw' U' L U' L' U2 Lw", "R U2 R' U2 R' F R F'", "(y2) Rw' U' R U' R' U2 Rw"],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
