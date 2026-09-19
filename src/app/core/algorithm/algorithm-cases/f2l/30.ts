import { defineF2lCase } from './f2l-case';

/** F2L 30のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_30_CASE = defineF2lCase({
  number: '30',
  group: 'Corner in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'ee4dd02c-173e-40fa-abd9-dc50ac7994b3-dummy', notation: "R U R'" }],
});
