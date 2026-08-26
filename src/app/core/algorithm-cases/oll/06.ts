import { defineOllCase } from './oll-case';

/** OLL 06のケース定義。 */
export const OLL_06_CASE = defineOllCase({
  number: '06',
  names: ['Right front wide antisune (RFWAS)', 'Righty Square'],
  group: 'Square Shape',
  algorithms: [{ id: '3a7ea1ba-d4e6-4811-bbe5-023c655d3a58', notation: "Rw U2 R' U' R U' Rw'" }],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
