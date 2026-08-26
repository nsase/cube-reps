import { defineOllCase } from './oll-case';

/** OLL 02のケース定義。 */
export const OLL_02_CASE = defineOllCase({
  number: '02',
  names: ['Zamboni'],
  group: 'Dot',
  algorithms: [
    { id: 'bbdfd618-8a43-4990-a24d-edb65e9240be', notation: "Rw U Rw' U2 Rw U2 R' U2 R U' Rw'" },
    {
      id: '030f1f02-de3d-4f7b-8692-b42a764fcd07',
      notation: "(y') F R U R' U' F' Fw R U R' U' Fw'",
    },
    { id: 'b00d41f7-0f24-4fc0-b839-d796cd089efa', notation: "(y') F R U R' U' S R U R' U' Fw'" },
    { id: '8e8dd831-4b99-4e3b-a8f2-1a56c6a1ff51', notation: "(y2) R U' R2 D' Rw U Rw' D R2 U R'" },
    { id: '7e4a2d49-7417-428e-9acb-0649577c4f1e', notation: "(y) Fw U R U' R' S' U R U' R' F'" },
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
