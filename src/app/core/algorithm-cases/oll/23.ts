import { defineOllCase } from './oll-case';

/** OLL 23のケース定義。 */
export const OLL_23_CASE = defineOllCase({
  number: '23',
  names: ['U', 'Headlights', 'Superman'],
  group: 'Cross',
  setup: "R' U2 R' D' R U2 R' D R2",
  algorithms: [
    { id: '323cd5cf-66b6-4e64-8375-3fe0910b1ffe', notation: "R2 D' R U2 R' D R U2 R" },
    { id: 'dcff8d79-8711-4739-8a46-1f89e02ba7af', notation: "(y2) R2 D R' U2 R D' R' U2 R'" },
    { id: '7c8fa941-a80c-41fc-9f5d-872a438cbef9', notation: "(R U R' U')3 (R' F R F')3" },
  ],
});
