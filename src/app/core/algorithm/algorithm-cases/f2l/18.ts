import { defineF2lCase } from './f2l-case';

/** F2L 18のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_18_CASE = defineF2lCase({
  number: '18',
  group: 'Connected Pairs',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'a690d4e4-fbf4-4561-8b8e-3c3f81ee933f-dummy', notation: "R U R'" }],
});
