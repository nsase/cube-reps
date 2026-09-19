import { defineF2lCase } from './f2l-case';

/** F2L 32のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_32_CASE = defineF2lCase({
  number: '32',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '7f3f075f-e8f3-4d46-8c81-7b7a849d7aac-dummy', notation: "R U R'" }],
});
