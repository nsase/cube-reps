import { defineF2lCase } from './f2l-case';

/** F2L 38のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_38_CASE = defineF2lCase({
  number: '38',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'bfc48167-1bda-4c98-b3ff-af8c711a8c1d-dummy', notation: "R U R'" }],
});
