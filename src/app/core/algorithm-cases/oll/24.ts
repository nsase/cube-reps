import { defineOllCase } from './oll-case';

/** OLL 24のケース定義。 */
export const OLL_24_CASE = defineOllCase({
  number: '24',
  names: ['T', 'Chameleon', 'Shark', 'Hammerhead', 'Little Horse', 'Stingray'],
  group: 'Cross',
  algorithms: ["Rw U R' U' Rw' F R F'", "y R U R D R' U' R D' R2", "(U2) Lw' U' L U Lw F' L' F"],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
  ],
});
