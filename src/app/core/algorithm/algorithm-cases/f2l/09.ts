import { defineF2lCase } from './f2l-case';

/** F2L 09のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_09_CASE = defineF2lCase({
  number: '09',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "F' U F U' R U R' U",
  algorithms: [
    { id: '29963682-0b31-477c-9f72-3d0f50a2cbb3', notation: "U' R U' R' U F' U' F" },
    { id: '52ab5e87-d367-4fd1-b4b1-70f228bb5598', notation: "F R U R' U' F' R U' R'" },
    { id: 'b1c39e88-2583-4d0f-832d-f6c4d1a1b9e9', notation: "U' R U' R' d R' U' R " },
  ],
});
