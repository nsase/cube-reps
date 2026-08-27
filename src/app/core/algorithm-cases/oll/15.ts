import { defineOllCase } from './oll-case';

/** OLL 15のケース定義。 */
export const OLL_15_CASE = defineOllCase({
  number: '15',
  names: ['Squeegee'],
  group: 'Knight Move Shape',
  setup: "R' F' R U' L' U L R' F R",
  algorithms: [
    { id: '14929b16-bf22-4a37-adfb-6c50c8f08a8f', notation: "Lw' U' Lw L' U' L U Lw' U Lw" },
    { id: '19044b5d-1875-4337-8d1d-2e6fe944ae84', notation: "(y2) Rw' U' Rw R' U' R U Rw' U Rw" },
    { id: 'e45c08a8-a625-43e0-afd7-1226203d7d37', notation: "R' F' R L' U' L U R' F R" },
  ],
});
