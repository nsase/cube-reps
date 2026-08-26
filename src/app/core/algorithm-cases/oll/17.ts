import { defineOllCase } from './oll-case';

/** OLL 17のケース定義。 */
export const OLL_17_CASE = defineOllCase({
  number: '17',
  names: ['Slash', 'Diagonal'],
  group: 'Dot',
  algorithms: [
    { id: 'e04925c1-10b4-4fb0-96a3-96e5fece3450', notation: "F R' F' R2 Rw' U R U' R' U' M'" },
    {
      id: 'bda4b333-2295-4252-a9b7-a42a87b60dc9',
      notation: "(y2) R U R' U R' F R F' U2 R' F R F'",
    },
    { id: 'd256bc9f-2123-4136-8535-310a7bdad773', notation: "F R' F' R U S' R U' R' S" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
