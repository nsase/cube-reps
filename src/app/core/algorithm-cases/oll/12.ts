import { defineOllCase } from './oll-case';

/** OLL 12のケース定義。 */
export const OLL_12_CASE = defineOllCase({
  number: '12',
  names: ['Upstairs'],
  group: 'Small Lightning Bolt',
  algorithms: [
    { id: 'a7fca47b-0a9c-419b-9b96-ef2b3f90ff51', notation: "M' R' U' R U' R' U2 R U' R Rw'" },
    { id: '3e413ed3-8ddc-4c7c-9cf6-bd4f15192f86', notation: "Rw R2 U' R U' R' U2 R U' Rw' R" },
    { id: '44e3bebe-c135-484a-bc4e-12e892e8fcd2', notation: "(y2) Lw L2 U' L U' L' U2 L U' M'" },
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
