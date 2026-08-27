import { defineOllCase } from './oll-case';

/** OLL 32のケース定義。 */
export const OLL_32_CASE = defineOllCase({
  number: '32',
  names: ['Anti-Couch'],
  group: 'P Shape',
  setup: "L F' L' U' L U F U' L'",
  algorithms: [
    { id: '61f88a1d-7cb9-45ef-a4ee-38b1d53feba3', notation: "L U F' U' L' U L F L'" },
    { id: '93d0bcf6-b6c4-4cfb-8ade-cd9d3a13b8d7', notation: "(y2) S R U R' U' R' F R Fw'" },
    { id: 'bbe2fa5a-d237-480b-b472-4ab6e8a6de58', notation: "(y2) R U B' U' R' U R B R'" },
  ],
  pattern: [
    ['none', 'none', 'none', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
