import { defineF2lCase } from './f2l-case';

/** F2L 10のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_10_CASE = defineF2lCase({
  number: '10',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "R U' R' U' R U' R' U",
  algorithms: [
    { id: 'cc3e9e91-513c-43e4-be0a-e27084b73404', notation: "U' R U R' U R U R'" },
    { id: '068dd0cd-034f-4bbe-9274-56d843c0ba75', notation: "U2 R U' R' U' R U R'" },
  ],
});
