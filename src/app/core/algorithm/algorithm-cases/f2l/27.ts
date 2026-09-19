import { defineF2lCase } from './f2l-case';

/** F2L 27のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_27_CASE = defineF2lCase({
  number: '27',
  group: 'Corner in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '3b2df4bf-d281-4b97-9515-5e7dc16ce8c7-dummy', notation: "R U R'" }],
});
