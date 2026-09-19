import { defineF2lCase } from './f2l-case';

/** F2L 21のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_21_CASE = defineF2lCase({
  number: '21',
  group: 'Connected Pairs',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '04380496-f858-4910-86fb-70c44cac2e45-dummy', notation: "R U R'" }],
});
