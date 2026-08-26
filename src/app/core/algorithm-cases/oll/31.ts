import { defineOllCase } from './oll-case';

/** OLL 31のケース定義。 */
export const OLL_31_CASE = defineOllCase({
  number: '31',
  names: ['Couch'],
  group: 'P Shape',
  algorithms: [{ id: '6df83e21-c893-4bfd-a8b2-76578eaf03ba', notation: "R' U' F U R U' R' F' R" }],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
