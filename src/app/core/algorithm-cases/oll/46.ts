import { defineOllCase } from './oll-case';

/** OLL 46のケース定義。 */
export const OLL_46_CASE = defineOllCase({
  number: '46',
  names: ["Seein' Headlights (C and headlights)"],
  group: 'C Shape',
  algorithms: [{ id: '188814e2-5a0a-429c-ab5d-1f771da22899', notation: "R' U' R' F R F' U R" }],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'none', 'none'],
  ],
});
