import { defineOllCase } from './oll-case';

/** OLL 21のケース定義。 */
export const OLL_21_CASE = defineOllCase({
  number: '21',
  names: ['H', 'Double Sune', 'Flip', 'Cross'],
  group: 'Cross',
  algorithms: [
    { id: 'c7fa9119-7fe4-40e1-914d-165adcae3bf0', notation: "R U2 R' U' R U R' U' R U' R'" },
    { id: '951da85a-b370-4d74-a215-37d6e9b88c8e', notation: "(y) R U R' U R U' R' U R U2 R'" },
    { id: '974565a9-ac33-46b0-a250-937987885575', notation: "(y) R' U' R U' R' U R U' R' U2' R" },
    { id: '0426a84c-de61-4ebf-b620-ee8e9cecee7e', notation: "(y2) R U2 R' U' R U R' U' R U' R'" },
    { id: '6127c873-82f1-4d9c-9522-6a1a88ec3703', notation: "(y) U F (R U R' U')3 F'" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
  ],
});
