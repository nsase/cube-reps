import { defineOllCase } from './oll-case';

/** OLL 35のケース定義。 */
export const OLL_35_CASE = defineOllCase({
  number: '35',
  names: ['Fish Salad'],
  group: 'Fish Shape',
  algorithms: [
    { id: '20b7426b-0d33-43bd-8aba-a54fb1cfdc35', notation: "R U2 R' R' F R F' R U2 R'" },
    { id: 'b243d251-3806-4a7e-affe-2a3dce47b30f', notation: "R U2 R2 F R F' R U2 R'" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'none', 'yellow'],
    ['yellow', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'none', 'none', 'none'],
  ],
});
