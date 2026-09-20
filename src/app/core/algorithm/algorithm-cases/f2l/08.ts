import { defineF2lCase } from './f2l-case';

/** F2L 08のケース定義。Solve・Setupは画面構築用のダミー。 */
export const F2L_08_CASE = defineF2lCase({
  number: '08',
  group: 'Disconnected Pairs',
  slot: 'FR',
  setup: "r' U' R2 U' R2' U2' r",
  algorithms: [
    { id: 'd56308c4-1d24-4790-a7d6-ed87e27e4fb7', notation: "r' U2 R2 U R2 U r" },
    { id: '9239c2e8-d232-4d10-be62-c5260c015fb1', notation: "y' U R' U2 R U2 R' U R" },
    { id: '00faa1d5-1b6f-4c51-be4a-2fc5ec46849a', notation: "y U L' U2 L U2 L' U L" },
    { id: 'cb4aafbc-37ae-4da2-9489-c84f88476b3b', notation: "F' U' L' U2 L U' F" },
    { id: 'f0b1c8d4-1b2a-4c5a-8f3e-1a2b3c4d5e6f', notation: "U F' U2 F U F' U2 F" },
    { id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', notation: "U F' U2 L' U L U' F'" },
    { id: 'b1c2d3e4-5f6a-7b8c-9d0e-1f2a3b4c5d6e', notation: "U F' U2 F U2 F' U F" },
  ],
});
