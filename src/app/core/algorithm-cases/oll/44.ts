import { defineOllCase } from './oll-case';

/** OLL 44のケース定義。 */
export const OLL_44_CASE = defineOllCase({
  number: '44',
  names: ['P'],
  group: 'P Shape',
  algorithms: [
    { id: 'fda97a4c-49f0-4f02-9542-f07550eade16', notation: "F (U R U' R') F'" },
    { id: 'b9c20726-cb80-4879-8e33-948bcfb6e3e8', notation: "(y2) Fw (R U R' U') Fw'" },
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
