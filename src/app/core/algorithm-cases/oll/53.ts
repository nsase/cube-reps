import { defineOllCase } from './oll-case';

/** OLL 53のケース定義。 */
export const OLL_53_CASE = defineOllCase({
  number: '53',
  names: ['Frying Pan'],
  group: 'Small L Shape',
  algorithms: [
    { id: 'b805bf7d-bfde-45ac-b925-f12e2cdb577b', notation: "Lw' U2 L U L' U' L U L' U Lw" },
    { id: '5b1eb6df-71cb-41f0-a495-916e15e3d2fd', notation: "(y2) Rw' U2 (R U R' U') R U R' U Rw" },
    { id: '671b2193-fde8-40ec-972a-f0d8d5f24067', notation: "(y) Rw' U' R U' R' U R U' R' U2 Rw" },
    { id: 'cb215f3a-b130-4c87-ac68-5603468f67bb', notation: "(y') Lw' U' L U' L' U L U' L' U2 Lw" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
  ],
});
