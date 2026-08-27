import { defineOllCase } from './oll-case';

/** OLL 55のケース定義。 */
export const OLL_55_CASE = defineOllCase({
  number: '55',
  names: ['Highway', 'Freeway'],
  group: 'I Shape',
  setup: "F R' F' U2 R U R' U R2 U2 R'",
  algorithms: [
    {
      id: 'e0f34029-552e-415a-8c1b-a40702e2c307',
      notation: "R' F R U R U' R2 F' R2 U' R' U R U R'",
    },
    { id: '9386d221-cf90-4ae0-bd02-260356cbc00a', notation: "(y) R U2 R2 U' R U' R' U2 F R F'" },
    { id: '53e3aeb6-42f3-4b9a-bbc0-bce07f48e976', notation: "R' F U R U' R2 F' R2 U R' U' R" },
    {
      id: '75826015-b973-494d-9fe9-6deb65ce6302',
      notation: "Rw U2 R' U' Rw' R2 U R' U' Rw U' Rw'",
    },
  ],
  pattern: [
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
  ],
});
