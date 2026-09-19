import { defineF2lCase } from './f2l-case';

/** F2L 39のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_39_CASE = defineF2lCase({
  number: '39',
  group: 'Pieces in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '150246ac-5309-4653-884f-6f3dfe3698ed-dummy', notation: "R U R'" }],
});
