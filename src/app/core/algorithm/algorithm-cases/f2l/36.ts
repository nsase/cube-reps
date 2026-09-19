import { defineF2lCase } from './f2l-case';

/** F2L 36のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_36_CASE = defineF2lCase({
  number: '36',
  group: 'Edge in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'a3d0b756-bb7b-48ea-aaf9-405857307eb8-dummy', notation: "R U R'" }],
});
