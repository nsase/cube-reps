import { defineF2lCase } from './f2l-case';

/** F2L 33のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_33_CASE = defineF2lCase({
  number: '33',
  group: 'Edge in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'c43c3966-fb6b-448b-9670-ad659496ff61-dummy', notation: "R U R'" }],
});
