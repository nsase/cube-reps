import { defineOllCase } from './oll-case';

/** OLL 16のケース定義。 */
export const OLL_16_CASE = defineOllCase({
  number: '16',
  names: ['Anti-Squeegee'],
  group: 'Knight Move Shape',
  algorithms: [
    { id: '7861fee3-0397-4d90-b220-f3be4d92cd11', notation: "Rw U Rw' R U R' U' Rw U' Rw'" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
