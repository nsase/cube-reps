import { defineF2lCase } from './f2l-case';

/** F2L 13のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_13_CASE = defineF2lCase({
  number: '13',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U' R' U2' R U R'",
  algorithms: [
    { id: '48acc33a-178f-4ff1-95de-a95b8d35c279', notation: "U2 R U R' U R U' R'" },
    { id: 'a56c491d-8bf7-4eff-88e0-a4cfc51bffbb', notation: "R U' R' U2 R U R'" },
    { id: '44116dec-1e32-4efb-b1cc-87d6c1cd953e', notation: "R B U2 B' R'" },
  ],
});
