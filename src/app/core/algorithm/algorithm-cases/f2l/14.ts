import { defineF2lCase } from './f2l-case';

/** F2L 14のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_14_CASE = defineF2lCase({
  number: '14',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'd7f0d5c2-9653-497f-9818-823a22ef61fe-dummy', notation: "R U R'" }],
});
