import { defineOllCase } from './oll-case';

/** OLL 48のケース定義。 */
export const OLL_48_CASE = defineOllCase({
  number: '48',
  names: ['Breakneck'],
  group: 'Small L Shape',
  setup: "F U R U' R' U R U' R' F'",
  algorithms: [
    { id: 'd0a9b80d-b672-4fdf-ac9e-00ee4a48330b', notation: "F R U R' U' R U R' U' F'" },
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
