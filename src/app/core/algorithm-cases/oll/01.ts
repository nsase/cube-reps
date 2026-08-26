import { defineOllCase } from './oll-case';

/** OLL 01のケース定義。 */
export const OLL_01_CASE = defineOllCase({
  number: '01',
  names: ['Runway', 'Blank'],
  group: 'Dot',
  algorithms: [
    { id: '826f069f-68ba-4a71-bcb3-43c8b7c88f6d', notation: "R U2 R2 F R F' U2 R' F R F'" },
    { id: '881597ae-6f65-41fd-a594-6e71bebcc18c', notation: "(U) R U' R2 D' Rw U' Rw' D R2 U R'" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
