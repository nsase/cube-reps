import { defineF2lCase } from './f2l-case';

/** F2L 01のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_01_CASE = defineF2lCase({
  number: '01',
  group: 'Easy Inserts',
  slot: 'FR',
  setup: "R U R' U'",
  algorithms: [
    { id: 'fef0ef90-e57b-4f15-ac02-7504c0abba50', notation: "U R U' R'" },
    { id: 'b1f52af8-c69d-418b-bd11-0b13b20cabee', notation: "R' F R F'" },
  ],
});
