import { defineOllCase } from './oll-case';

/** OLL 36のケース定義。 */
export const OLL_36_CASE = defineOllCase({
  number: '36',
  names: ['Sea-Mew', 'Wario', 'Anti-Moustache'],
  group: 'W Shape',
  algorithms: [
    { id: '73357e37-b2dc-41b3-aef5-aaf136148cbc', notation: "L' U' L U' L' U L U L F' L' F" },
    { id: '2681cc58-cc40-4793-a65d-a66cf6ac63b1', notation: "(y2) R' U' R U' R' U R U R B' R' B" },
    {
      id: 'db09b1e3-57bd-43fd-8335-fecfbea7af15',
      notation: "R U R' F' R U R' U' R' F R U' R' F R F'",
    },
    { id: '64b5b576-173a-4882-b449-d89ed3231676', notation: "R' F' U' F2 U R U' R' F' R" },
    { id: '5c8e1711-12e6-4599-a485-93e5a07f4833', notation: "(y') R U R2 F' U' F U R2 U2 R'" },
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
