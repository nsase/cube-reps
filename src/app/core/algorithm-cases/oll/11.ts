import { defineOllCase } from './oll-case';

/** OLL 11のケース定義。 */
export const OLL_11_CASE = defineOllCase({
  number: '11',
  names: ['Downstairs'],
  group: 'Small Lightning Bolt',
  setup: "F U R U' R' F' U' F' U' L' U L F",
  algorithms: [
    {
      id: '15828a59-92f3-4bd7-a829-780e60363dbc',
      notation: "F' L' U' L U F U F R U R' U' F'",
    },
    { id: 'f5273459-e0f0-47aa-ac04-395458222bee', notation: "(y) Rw U R' U R' F R F' R U2 Rw'" },
    { id: '38f484df-d783-4016-a8e1-71deb5381110', notation: "(y') Rw' R2 U R' U R U2 R' U M'" },
  ],
});
