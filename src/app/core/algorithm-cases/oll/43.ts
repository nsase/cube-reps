import { defineOllCase } from './oll-case';

/** OLL 43のケース定義。 */
export const OLL_43_CASE = defineOllCase({
  number: '43',
  names: ['Anti-P'],
  group: 'P Shape',
  setup: "F' L' U' L U F",
  algorithms: [
    { id: '8bcaae1a-a686-4447-86d9-c2cfbf3518c4', notation: "F' U' L' U L F" },
    { id: 'c9a281c3-cb8c-4430-adc9-88c38f30f8f9', notation: "R' U' F R' F' R U R" },
    { id: 'd75000f4-c1d4-4805-952c-750bd8ca9b1e', notation: "(y') R' U' F' U F R" },
  ],
});
