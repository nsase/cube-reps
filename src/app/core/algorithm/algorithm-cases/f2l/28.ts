import { defineF2lCase } from './f2l-case';

/** F2L 28のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_28_CASE = defineF2lCase({
  number: '28',
  group: 'Corner in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'eeb75dbd-5460-4868-be8f-aa0f51fcbb59-dummy', notation: "R U R'" }],
});
