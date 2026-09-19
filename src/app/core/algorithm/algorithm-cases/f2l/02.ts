import { defineF2lCase } from './f2l-case';

/** F2L 02のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_02_CASE = defineF2lCase({
  number: '02',
  group: 'Easy Inserts',
  slot: 'FR',
  setup: "R' F R F'",
  algorithms: [
    { id: '5ed38198-0479-4bba-9dd3-edbf2e17c3e0-dummy', notation: "F R' F' R" },
    { id: '5a0a8ea5-2a77-4a38-bad2-09edf4144c86-dummy', notation: "(y') U' R' U R " },
    { id: '5a0a8ea5-2a77-4a38-bad2-09edf4144c86-dummy', notation: "U' F' U F" },
    { id: '5a0a8ea5-2a77-4a38-bad2-09edf4144c86-dummy', notation: "(y) U' L' U L " },
  ],
});
