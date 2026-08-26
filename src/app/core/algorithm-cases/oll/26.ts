import { defineOllCase } from './oll-case';

/** OLL 26のケース定義。 */
export const OLL_26_CASE = defineOllCase({
  number: '26',
  names: ['Antisune', 'AS', 'S-', 'Swimming Right'],
  group: 'Cross',
  algorithms: [
    { id: '0c219d99-9815-44b1-a996-857414ed7390', notation: "(R U2 R') U' R U' R'" },
    { id: '93545836-54f9-471c-b39f-13ae2bf56f3a', notation: "(y') R' U' R U' R' U2 R" },
    { id: '6283da3c-8874-4cc2-82aa-aef10493621c', notation: "(y) L' U' L U' L' U2 L" },
  ],
  pattern: [
    ['none', 'none', 'none', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
  ],
});
