import { defineF2lCase } from './f2l-case';

/** F2L 24のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_24_CASE = defineF2lCase({
  number: '24',
  group: 'Connected Pairs',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '65a5f265-9aa9-40f6-82ba-565e2886ba61-dummy', notation: "R U R'" }],
});
