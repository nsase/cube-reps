import { defineOllCase } from './oll-case';

/** OLL 01のケース定義。 */
export const OLL_01_CASE = defineOllCase({
  number: '01',
  names: ['Runway', 'Blank'],
  group: 'Dot',
  algorithms: ["R U2 R2 F R F' U2 R' F R F'", "(U) R U' R2 D' Rw U' Rw' D R2 U R'"],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'none', 'none', 'yellow'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
