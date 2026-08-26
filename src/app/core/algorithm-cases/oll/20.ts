import { defineOllCase } from './oll-case';

/** OLL 20のケース定義。 */
export const OLL_20_CASE = defineOllCase({
  number: '20',
  names: ['X', 'Checkers'],
  group: 'Dot',
  algorithms: [
    { id: '450e0068-6dbf-441b-bb5b-bbe4c2f22c8c', notation: "Rw U R' U' M2 U R U' R' U' M'" },
    { id: 'f3f44fd8-cd90-47d3-a5ba-78742f4005b9', notation: "Rw' R U (R U R' U') M2 U R U' Rw'" },
    {
      id: '8640bec1-61d2-48b5-b65f-8540c7772e99',
      notation: "Rw' R U (R U R' U') Rw R' M' U R U' Rw'",
    },
    { id: '4302df25-8574-4b50-a71d-a1eb1977f5c9', notation: "Rw U R' U' Rw R' M' U R U' R' U' M'" },
    { id: 'ca5adc14-756d-4bc2-b319-338b7727612f', notation: "S' R U R' S U' M' U R U' Rw'" },
    { id: '3f61b4d4-2f02-43d4-aeb4-1f825c0d186b', notation: "M U (R U R' U') M2 (U R U' Rw')" },
  ],
  pattern: [
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['yellow', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
  ],
});
