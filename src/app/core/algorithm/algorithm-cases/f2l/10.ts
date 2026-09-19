import { defineF2lCase } from './f2l-case';

/** F2L 10のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_10_CASE = defineF2lCase({
  number: '10',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'cc3e9e91-513c-43e4-be0a-e27084b73404-dummy', notation: "R U R'" }],
});
