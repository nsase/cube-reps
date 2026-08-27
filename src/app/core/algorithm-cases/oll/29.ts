import { defineOllCase } from './oll-case';

/** OLL 29のケース定義。 */
export const OLL_29_CASE = defineOllCase({
  number: '29',
  names: ['Spotted Chameleon'],
  group: 'Awkward Shape',
  setup: "R U' R' F' U F R U R' U R U' R'",
  algorithms: [
    { id: 'df2110a7-6622-4ce8-8e5d-97556208f726', notation: "R U R' U' R U' R' F' U' F R U R'" },
    {
      id: 'cc8090f7-9ed3-43c9-8c73-e086113e61c5',
      notation: "R U R' U' R' F R F' R U R' U' M' U R U' Rw'",
    },
    {
      id: 'b086e8e9-c7f5-4beb-a4d4-434c4b0a8ed3',
      notation: "(y') Rw2 D' Rw U Rw' D Rw2 U' Rw' U' Rw",
    },
  ],
});
