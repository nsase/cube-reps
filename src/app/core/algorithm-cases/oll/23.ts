import { defineOllCase } from './oll-case';

/** OLL 23のケース定義。 */
export const OLL_23_CASE = defineOllCase({
  number: '23',
  names: ['U', 'Headlights', 'Superman'],
  group: 'Cross',
  algorithms: [
    "R2 D' R U2 R' D R U2 R",
    "y2 R2 D R' U2 R D' R' U2 R'",
    "(U2) R2 D R' U2 R D' R' U2 R'",
    "(R U R' U')3 (R' F R F')3",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
  ],
});
