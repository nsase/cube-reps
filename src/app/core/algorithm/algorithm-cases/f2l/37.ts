import { defineF2lCase } from './f2l-case';

/** F2L 37のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_37_CASE = defineF2lCase({
  number: '37',
  group: 'Pieces in Slot',
  slot: 'FR',
  setup: "R U' R'",
  algorithms: [{ id: '5d0f5af8-76f5-4066-9f6e-219277ae9b04-dummy', notation: "R U R'" }],
});
