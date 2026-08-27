import { defineOllCase } from './oll-case';

/** OLL 13のケース定義。 */
export const OLL_13_CASE = defineOllCase({
  number: '13',
  names: ['Gun', 'Trigger'],
  group: 'Knight Move Shape',
  setup: "F R U' R' U R U2 R' U' F'",
  algorithms: [
    { id: '2c7cd7b2-fd70-40b8-a703-fca797f0e2a6', notation: "F U R U' R2 F' R U R U' R'" },
    { id: 'e176cfbb-3ca2-4ae5-b27b-2fb3f0e3f7b1', notation: "F U R U2 R' U' R U R' F'" },
    { id: '446c628e-251b-4cd6-b9d6-b4bad10725f5', notation: "Rw U' Rw' U' Rw U Rw' F' U F" },
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
