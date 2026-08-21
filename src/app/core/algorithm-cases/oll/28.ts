import { defineOllCase } from './oll-case';

/** OLL 28のケース定義。 */
export const OLL_28_CASE = defineOllCase({
  number: '28',
  names: ['Stealth', 'Arrow', 'Arrowhead', 'Fish'],
  group: 'Corners Oriented',
  algorithms: [
    "Rw U R' U' Rw' R U R U' R'",
    "U2 (M' U Lw L') U2 (M' U Lw L')",
    "U2 (M' U M) U2 (M' U M)",
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
