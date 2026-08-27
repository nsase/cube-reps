import { defineOllCase } from './oll-case';

/** OLL 08のケース定義。 */
export const OLL_08_CASE = defineOllCase({
  number: '08',
  names: ['Wide Left Sune', 'Reverse Lightning'],
  group: 'Small Lightning Bolt',
  setup: "F R' F' R U2 R U2 R'",
  algorithms: [
    { id: '1efa9ee0-5dac-4fdb-b164-663d8bcc239a', notation: "Lw' U' L U' L' U2 Lw" },
    { id: '8643a4a8-55dd-4bbf-8d09-e23e32ac2607', notation: "R U2 R' U2 R' F R F'" },
    { id: '85f32050-dc1e-45e3-a1c2-8ace380e76d6', notation: "(y2) Rw' U' R U' R' U2 Rw" },
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
  ],
});
