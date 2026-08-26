import { defineOllCase } from './oll-case';

/** OLL 10のケース定義。 */
export const OLL_10_CASE = defineOllCase({
  number: '10',
  names: ['Anti-Kite'],
  group: 'Fish Shape',
  algorithms: [
    { id: '47cda92c-1734-4597-ab5a-d07e3e3efd3c', notation: "R U R' U R' F R F' R U2 R'" },
    {
      id: '298ac73a-5b1a-48a4-a8f7-56524251bcfa',
      notation: "(y2) Rw U R' U R U' R' U' Rw' R (U R U' R')",
    },
    { id: '6134b011-118f-478c-bd40-881a3a52acb2', notation: "(y) F U F' R' F R U' R' F' R" },
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
