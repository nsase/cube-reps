import { defineOllCase } from './oll-case';

/** OLL 22のケース定義。 */
export const OLL_22_CASE = defineOllCase({
  number: '22',
  names: ['Pi', 'Bruno', 'Wheel', 'T-shirt', 'Antarctica'],
  group: 'Cross',
  setup: "R' U2 R2 U R2 U R2 U2 R'",
  algorithms: [
    { id: '14341da6-51e2-436f-8d69-fc0ccdbea2cc', notation: "R U2 R2 U' R2 U' R2 U2 R" },
    { id: 'bb63de33-f566-4b8d-9465-729c40d0b815', notation: "Fw R U R' U' S' R U R' U' F'" },
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
