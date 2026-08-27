import { defineOllCase } from './oll-case';

/** OLL 39のケース定義。 */
export const OLL_39_CASE = defineOllCase({
  number: '39',
  names: ['Fung'],
  group: 'Big Lightning Bolt',
  setup: "L U F' U' L' U L F L'",
  algorithms: [
    { id: 'c9463ba2-da78-4324-bcff-16258664f06d', notation: "L F' L' U' L U F U' L'" },
    { id: 'b98f0751-eb78-4574-a7cf-812ff5460993', notation: "(y2) R B' R' U' R U B U' R'" },
    { id: '8405136a-6f4c-4360-8091-4a0efdd3993a', notation: "(y2) R U R' F' U' F U R U2 R'" },
    { id: 'd9cb002d-56b0-4227-aae4-99a09967ba04', notation: "(y2) Fw' Rw U Rw' U' Rw' F Rw S" },
  ],
});
