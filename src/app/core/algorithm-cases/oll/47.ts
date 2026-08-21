import { defineOllCase } from './oll-case';

/** OLL 47のケース定義。 */
export const OLL_47_CASE = defineOllCase({
  number: '47',
  names: ['Anti-Breakneck'],
  group: 'Small L Shape',
  algorithms: [
    "R' U' R' F R F' R' F R F' U R",
    "F' L' U' L U L' U' L U F",
    "y' F U R U' R' F' R U R' U R U2 R'",
    "(U') F R' F' R U2 R U' R' U R U2 R'",
    "(U') R' F' U' F U F' U' F U R",
  ],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
