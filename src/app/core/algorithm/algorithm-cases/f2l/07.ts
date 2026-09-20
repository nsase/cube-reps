import { defineF2lCase } from './f2l-case';

/** F2L 07のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_07_CASE = defineF2lCase({
  number: '07',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U2' R' U R U2' R' U",
  algorithms: [
    { id: '2d3110dd-fc0a-4246-8f9c-2d5c2f90cfae', notation: "U' R U2 R' U' R U2 R'" },
    { id: '6f07af80-4925-4a79-a867-229ac5a90b66', notation: "U' R U2 R' U2 R U' R'" },
    { id: 'b935a1f1-0e91-41ba-9c9b-58dd41dacf2a', notation: "U' R U2 R' U R' F R F'" },
    { id: 'e17cd379-ee82-4464-9b27-851810ec0f0f', notation: "M' U' M U2 r U' r'" },
  ],
});
