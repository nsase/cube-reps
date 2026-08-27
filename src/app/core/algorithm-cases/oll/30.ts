import { defineOllCase } from './oll-case';

/** OLL 30のケース定義。 */
export const OLL_30_CASE = defineOllCase({
  number: '30',
  names: ['Anti-Spotted Chameleon'],
  group: 'Awkward Shape',
  setup: "F2 R U' R' U R U R2 F' R F'",
  algorithms: [
    { id: 'b634988f-1f37-4ae6-9f82-def883417760', notation: "F R' F R2 U' R' U' R U R' F2" },
    { id: 'af6645aa-3cce-46f3-888d-14fdf5723507', notation: "F U (R U2 R' U') R U2 R' U' F'" },
    {
      id: '8a7aa104-a5f8-4690-9ea1-fb2abc517a79',
      notation: "(y) Rw' D' Rw U' Rw' D Rw2 U' Rw' U Rw U Rw'",
    },
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
