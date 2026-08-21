import { defineOllCase } from './oll-case';

/** OLL 43のケース定義。 */
export const OLL_43_CASE = defineOllCase({
  number: '43',
  names: ['Anti-P'],
  group: 'P Shape',
  algorithms: ["F' U' L' U L F", "R' U' F R' F' R U R", "(y') R' U' F' U F R"],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['yellow', 'none', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
