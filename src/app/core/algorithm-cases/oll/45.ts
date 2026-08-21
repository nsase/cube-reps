import { defineOllCase } from './oll-case';

/** OLL 45のケース定義。 */
export const OLL_45_CASE = defineOllCase({
  number: '45',
  names: ['Suit up', 'T'],
  group: 'T Shape',
  algorithms: ["F R U R' U' F'"],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
