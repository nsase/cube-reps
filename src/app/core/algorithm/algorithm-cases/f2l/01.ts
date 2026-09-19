import { defineF2lCase } from './f2l-case';

/** F2L 01のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_01_CASE = defineF2lCase({
  number: '01',
  group: 'Easy Inserts',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'fef0ef90-e57b-4f15-ac02-7504c0abba50-dummy', notation: "R U R'" }],
});
