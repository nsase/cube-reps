import { defineOllCase } from './oll-case';

/** OLL 41のケース定義。 */
export const OLL_41_CASE = defineOllCase({
  number: '41',
  names: ['Awkward Fish', 'Dalmation'],
  group: 'Awkward Shape',
  algorithms: [
    { id: '8dcef7e6-0ff5-4d4c-a2c8-d90e475be827', notation: "R U R' U R U2 R' F R U R' U' F'" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
