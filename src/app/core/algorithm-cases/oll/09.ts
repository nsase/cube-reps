import { defineOllCase } from './oll-case';

/** OLL 09のケース定義。 */
export const OLL_09_CASE = defineOllCase({
  number: '09',
  names: ['Kite'],
  group: 'Fish Shape',
  setup: "F U R U' R2 F' R U R U' R'",
  algorithms: [
    { id: '382d1984-0ece-4cbb-9c14-918059fa5a18', notation: "R U R' U' R' F R2 U R' U' F'" },
  ],
});
