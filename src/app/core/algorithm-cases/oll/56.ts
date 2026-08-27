import { defineOllCase } from './oll-case';

/** OLL 56のケース定義。 */
export const OLL_56_CASE = defineOllCase({
  number: '56',
  names: ['Streetlights', 'Dead Man'],
  group: 'I Shape',
  setup: "F' U2 F2 R2 F2 U F2 U' R2 D U R U2 R D' R2 U F'",
  algorithms: [
    {
      id: 'fabbf521-df97-43dc-b5cf-e7945860b6c3',
      notation: "(Rw' U' Rw) U' R' U R U' R' U R Rw' U Rw",
    },
    {
      id: 'c6edda6d-1a1f-4673-b6aa-9fbe099c24ca',
      notation: "Rw U Rw' U R U' R' U R U' R' Rw U' Rw'",
    },
    {
      id: '060204cd-218a-475c-8295-25f9478db08c',
      notation: "Rw U Rw' U R U' R' U R U' M' U' Rw'",
    },
    {
      id: 'cb254693-6102-448e-bae7-f4eb59bf1d5d',
      notation: "Rw U Rw' U R U' R' U R U' R' Rw U' Rw'",
    },
    { id: '7e7185c2-eab3-4ac2-a0ea-bf965e7c78c8', notation: "Rw U Rw' U R U' R' M' U R U2 Rw'" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
