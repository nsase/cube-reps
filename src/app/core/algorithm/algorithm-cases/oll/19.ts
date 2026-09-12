import { defineOllCase } from './oll-case';

/** OLL 19のケース定義。 */
export const OLL_19_CASE = defineOllCase({
  number: '19',
  names: ['Bunny'],
  group: 'Dot',
  setup: "F R' F' R M U R U' R' U' M'",
  algorithms: [
    { id: '795f41aa-9ee6-4a7b-85db-f763fa11c8f5', notation: "Rw' R U R U R' U' M' R' F R F'" },
    { id: '455e284f-0cb8-403e-be90-5549512c0fe9', notation: "Rw' R U R U R' U' Rw R2 F R F'" },
    { id: '38bb5dab-4c83-40f1-8e2e-e905ffb3193c', notation: "(y) S' R U R' S U' R' F R F'" },
    { id: '8c234576-51af-4dca-bcd6-d377dc5e49f3', notation: "M U R U R' U' M' R' F R F'" },
  ],
});
