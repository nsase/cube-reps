import { defineF2lCase } from './f2l-case';

/** F2L 07のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_07_CASE = defineF2lCase({
  number: '7',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '2d3110dd-fc0a-4246-8f9c-2d5c2f90cfae-dummy', notation: "R U R'" }],
});
