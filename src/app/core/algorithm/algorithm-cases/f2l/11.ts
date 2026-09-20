import { defineF2lCase } from './f2l-case';

/** F2L 11のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_11_CASE = defineF2lCase({
  number: '11',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U R' U' R U2' R' U'",
  algorithms: [
    { id: 'dc331824-9ce2-4ea2-b961-ebb3efa90502', notation: "U R U2 R' U R U' R'" },
    { id: '4c958250-0a04-45cc-9546-345e4f7f39ce', notation: "U R U2 R2 F R F'" },
    { id: 'ec18e8c9-93cf-4429-b025-8843b27e86c0', notation: "R U' R' U R U' R' U R U R'" },
  ],
});
