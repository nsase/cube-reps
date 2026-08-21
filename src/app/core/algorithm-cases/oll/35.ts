import { defineOllCase } from './oll-case';

/** OLL 35のケース定義。 */
export const OLL_35_CASE = defineOllCase({
  number: '35',
  names: ['Fish Salad'],
  group: 'Fish Shape',
  algorithms: ["R U2 R' R' F R F' R U2 R'", "R U2 R2 F R F' R U2 R'"],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
  ],
});
