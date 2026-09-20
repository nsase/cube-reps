import { defineF2lCase } from './f2l-case';

/** F2L 05のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_05_CASE = defineF2lCase({
  number: '05',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U2' R' U R U' R' U",
  algorithms: [
    { id: '1df52fd1-c5c8-4479-88bd-07b7bc0ce63a', notation: "U' R U R' U2 R U' R'" },
    { id: '5dae29fd-7ca4-436f-b500-3ee92bf49c09', notation: "F2 L' U' L U F2" },
    { id: '0fde6ac2-33d4-4eef-ab8f-f6d7c8fb8527', notation: "U' R U R' U' R U2 R'" },
    { id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0', notation: "U' R U R' U R' F R F'" },
  ],
});
