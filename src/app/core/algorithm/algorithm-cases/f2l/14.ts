import { defineF2lCase } from './f2l-case';

/** F2L 14のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_14_CASE = defineF2lCase({
  number: '14',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "F' L' U2' L F",
  algorithms: [
    { id: 'd7f0d5c2-9653-497f-9818-823a22ef61fe', notation: "r U' r' U2 r U r'" },
    { id: 'c3335acb-5e75-4519-b15f-69d60fb918cb', notation: "F' L' U2 L F" },
  ],
});
