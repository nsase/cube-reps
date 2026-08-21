import { defineOllCase } from './oll-case';

/** OLL 27のケース定義。 */
export const OLL_27_CASE = defineOllCase({
  number: '27',
  names: ['Sune', 'S', 'Swimming Left'],
  group: 'Cross',
  algorithms: ["R U R' U R U2 R'", "y' R' U2 (R U R' U) R", "(U') R' U2 R U R' U R"],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
