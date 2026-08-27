import { defineOllCase } from './oll-case';

/** OLL 37のケース定義。 */
export const OLL_37_CASE = defineOllCase({
  number: '37',
  names: ['Mounted Fish', 'Untying Shoelaces'],
  group: 'Fish Shape',
  setup: "R U R' U' R' F R F'",
  algorithms: [
    { id: '84bc9e68-152f-429c-a1a0-2edcd722eca5', notation: "F R' F' R U R U' R'" },
    { id: 'c716a54f-06c0-4156-b252-c863c940f200', notation: "F R U' R' U' R U R' F'" },
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
