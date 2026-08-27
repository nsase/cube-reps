import { defineOllCase } from './oll-case';

/** OLL 38のケース定義。 */
export const OLL_38_CASE = defineOllCase({
  number: '38',
  names: ['Mario', 'Moustache'],
  group: 'W Shape',
  setup: "F R' F' R U R U R' U' R U' R'",
  algorithms: [
    { id: 'f4009f7c-0651-4c48-812d-12d142b708db', notation: "R U R' U R U' R' U' R' F R F'" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
