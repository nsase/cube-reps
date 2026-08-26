import { defineOllCase } from './oll-case';

/** OLL 24のケース定義。 */
export const OLL_24_CASE = defineOllCase({
  number: '24',
  names: ['T', 'Chameleon', 'Shark', 'Hammerhead', 'Little Horse', 'Stingray'],
  group: 'Cross',
  algorithms: [
    { id: 'e775b88f-32e6-4350-a4e5-1e5d4a889b6d', notation: "Rw U R' U' Rw' F R F'" },
    { id: '86601483-011a-4073-b9f2-b204ee6b1c2d', notation: "(y) R U R D R' U' R D' R2" },
    { id: '193aaecd-c729-47bd-a2d1-9239123472c6', notation: "(y2) Lw' U' L U Lw F' L' F" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
  ],
});
