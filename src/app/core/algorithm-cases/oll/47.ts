import { defineOllCase } from './oll-case';

/** OLL 47のケース定義。 */
export const OLL_47_CASE = defineOllCase({
  number: '47',
  names: ['Anti-Breakneck'],
  group: 'Small L Shape',
  setup: "F' U' L' U L U' L' U L F",
  algorithms: [
    { id: 'd72f4f6d-d468-4cd2-8266-ca365e73f874', notation: "R' U' R' F R F' R' F R F' U R" },
    { id: 'c53624bc-2b7a-43f6-90c1-08210575bfd5', notation: "F' L' U' L U L' U' L U F" },
    {
      id: 'cb54e781-c208-4037-91db-0427e2b613a2',
      notation: "(y') F U R U' R' F' R U R' U R U2 R'",
    },
    { id: '8bc67b37-9207-4378-9cf8-995d508a725f', notation: "(y') F R' F' R U2 R U' R' U R U2 R'" },
    { id: '74e7f5c4-4c75-421a-a1ad-b089b51f589c', notation: "(y') R' F' U' F U F' U' F U R" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
