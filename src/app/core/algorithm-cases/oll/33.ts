import { defineOllCase } from './oll-case';

/** OLL 33のケース定義。 */
export const OLL_33_CASE = defineOllCase({
  number: '33',
  names: ['Tying Shoelaces', 'Key'],
  group: 'T Shape',
  algorithms: ["R U R' U' R' F R F'"],
  pattern: [
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
