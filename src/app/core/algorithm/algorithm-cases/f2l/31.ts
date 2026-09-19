import { defineF2lCase } from './f2l-case';

/** F2L 31のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_31_CASE = defineF2lCase({
  number: '31',
  group: 'Edge in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'edc34784-810c-4f2e-8052-97d73034f5bf-dummy', notation: "R U R'" }],
});
