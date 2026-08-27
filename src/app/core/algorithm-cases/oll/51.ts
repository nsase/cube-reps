import { defineOllCase } from './oll-case';

/** OLL 51のケース定義。 */
export const OLL_51_CASE = defineOllCase({
  number: '51',
  names: ['Bottlecap', 'Ant'],
  group: 'I Shape',
  setup: "F R U R' U' R U R' U' F'",
  algorithms: [
    { id: 'ec0d3559-de54-4f93-81e6-972469bebd17', notation: "F U R U' R' U R U' R' F'" },
    { id: '367848ee-9bdf-462d-b141-6cebfad01bb1', notation: "(y2) Fw R U R' U' R U R' U' Fw'" },
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
