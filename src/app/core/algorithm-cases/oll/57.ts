import { defineOllCase } from './oll-case';

/** OLL 57のケース定義。 */
export const OLL_57_CASE = defineOllCase({
  number: '57',
  names: ['Mummy', 'H', 'I', 'Brick'],
  group: 'Corners Oriented',
  algorithms: [
    { id: 'c3b9f57e-e3e6-4010-a845-37ef2d142cc8', notation: "(R U R' U') M' (U R U' Rw')" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
