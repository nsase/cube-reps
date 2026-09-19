import { defineF2lCase } from './f2l-case';

/** F2L 16のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_16_CASE = defineF2lCase({
  number: '16',
  group: 'Connected Pairs',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '4a984724-e619-4bd4-a2a0-1fbd547f92e5-dummy', notation: "R U R'" }],
});
