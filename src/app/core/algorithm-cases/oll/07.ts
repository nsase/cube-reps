import { defineOllCase } from './oll-case';

/** OLL 07のケース定義。 */
export const OLL_07_CASE = defineOllCase({
  number: '07',
  names: ['Lightning', 'Wide Sune'],
  group: 'Small Lightning Bolt',
  setup: "F' L F L' U2 L' U2 L",
  algorithms: [
    { id: '2867d2d6-4154-481f-af14-66e10c8d796c', notation: "Rw U R' U R U2 Rw'" },
    { id: '541657c4-9b74-40f0-bf7b-6d9795d09e1f', notation: "L' U2 L U2 L F' L' F" },
  ],
});
