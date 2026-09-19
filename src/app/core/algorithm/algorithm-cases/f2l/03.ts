import { defineF2lCase } from './f2l-case';

/** F2L 03のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_03_CASE = defineF2lCase({
  number: '03',
  group: 'Easy Inserts',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '849d49f6-4441-4ef5-9fc6-06e28fbea9d4-dummy', notation: "R U R'" }],
});
