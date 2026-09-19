import { defineF2lCase } from './f2l-case';

/** F2L 05のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_05_CASE = defineF2lCase({
  number: '05',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '1df52fd1-c5c8-4479-88bd-07b7bc0ce63a-dummy', notation: "R U R'" }],
});
