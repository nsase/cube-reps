import { defineF2lCase } from './f2l-case';

/** F2L 06のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_06_CASE = defineF2lCase({
  number: '06',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "F' U' F U2' F' U F U'",
  algorithms: [
    { id: 'ff6a92a0-5390-4b9c-b39d-8225b3a5ad62', notation: "U' r U' R' U R U r'" },
    { id: 'e1b2c3d4-f5a6-7890-1234-56789abcdef0', notation: "U F' U' F U2 F' U F" },
    { id: 'd4e5f6a7-8901-2345-6789-abcdef012345', notation: "U F' U' F U' F R' F' R" },
  ],
});
