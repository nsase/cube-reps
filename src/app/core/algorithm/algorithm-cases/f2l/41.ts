import { defineF2lCase } from './f2l-case';

/** F2L 41のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_41_CASE = defineF2lCase({
  number: '41',
  group: 'Pieces in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'e3062c60-be2b-4dcc-a54f-8b2683490db2-dummy', notation: "R U R'" }],
});
