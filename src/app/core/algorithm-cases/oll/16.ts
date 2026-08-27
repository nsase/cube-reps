import { defineOllCase } from './oll-case';

/** OLL 16のケース定義。 */
export const OLL_16_CASE = defineOllCase({
  number: '16',
  names: ['Anti-Squeegee'],
  group: 'Knight Move Shape',
  setup: "R' U2 R U R' F U R U' R' F' R",
  algorithms: [
    { id: '7861fee3-0397-4d90-b220-f3be4d92cd11', notation: "Rw U Rw' R U R' U' Rw U' Rw'" },
    { id: 'f37fff89-529e-44da-ab66-53de806adb48', notation: "(y2) R' F R U R' U' F' R U' R' U2 R" },
  ],
});
