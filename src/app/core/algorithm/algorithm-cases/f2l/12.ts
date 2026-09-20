import { defineF2lCase } from './f2l-case';

/** F2L 12のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_12_CASE = defineF2lCase({
  number: '12',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U R' F R' F' R2' U R' U",
  algorithms: [
    { id: 'e17cd379-ee82-4464-9b27-851810ec0f0f', notation: "U' R U' R2 F R F' R U' R'" },
    { id: 'b4dc6902-c66e-4a3d-ac65-3259a17290a6', notation: "U' F' U2 F U' F' U F" },
    { id: '6bb82e26-64c1-4362-b22b-a351f2dbd621', notation: "y' U' R' U2 R U' R' U R" },
    { id: 'c180052c-0513-4e41-899d-de1b1c765ce2', notation: "y U' L' U2 L U' L' U L" },
  ],
});
