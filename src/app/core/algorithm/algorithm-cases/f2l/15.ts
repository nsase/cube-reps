import { defineF2lCase } from './f2l-case';

/** F2L 15のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_15_CASE = defineF2lCase({
  number: '15',
  group: 'Connected Pairs',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: 'cbc926d9-adcc-4895-8e85-3e1d5194ec7d-dummy', notation: "R U R'" }],
});
