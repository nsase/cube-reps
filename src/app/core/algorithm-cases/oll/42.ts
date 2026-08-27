import { defineOllCase } from './oll-case';

/** OLL 42のケース定義。 */
export const OLL_42_CASE = defineOllCase({
  number: '42',
  names: ['Lefty Awkward Fish', 'Anti-Dalmation'],
  group: 'Awkward Shape',
  setup: "F U R U' R' F' R' U2 R U R' U R",
  algorithms: [
    { id: '38a6794e-3c4f-4cde-82bb-bc27b4431b45', notation: "R' U' R U' R' U2 R F R U R' U' F'" },
    { id: '3143364b-21be-446d-af29-e0b7a4d1d51d', notation: "R' U' R U' R' U2 R U R' F' U' F U R" },
    {
      id: 'e840e0b7-89ed-44bb-a5fb-c127623e1011',
      notation: "(U) R' F R F' R' F R F' R U R' U' R U R'",
    },
    {
      id: 'f2a460dd-2f39-4c75-a918-5b45220c4b02',
      notation: "(U) F R' F' R U2 R' U' R2 U' R2 U2 R",
    },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
  ],
});
