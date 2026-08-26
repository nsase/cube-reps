import { defineOllCase } from './oll-case';

/** OLL 14のケース定義。 */
export const OLL_14_CASE = defineOllCase({
  number: '14',
  names: ['Anti-Gun', 'Anti-Trigger'],
  group: 'Knight Move Shape',
  algorithms: [
    { id: 'f588b571-2d1b-4040-8fbf-31bef37c24b1', notation: "R' F R U R' F' R F U' F'" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
