import { defineF2lCase } from './f2l-case';

/** F2L 04のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_04_CASE = defineF2lCase({
  number: '04',
  group: 'Easy Inserts',
  slot: 'FR',
  setup: "F' U F",
  algorithms: [
    { id: 'b054b565-b5f5-4180-8f34-897a93c06572', notation: "F' U' F" },
    { id: 'c4ca555d-9f80-48e0-b44d-9e19c8877372', notation: "y' R' U' R" },
    { id: '02c3e2aa-4c25-4bbf-bc10-f854adacb6d9', notation: "y L' U' L" },
  ],
});
