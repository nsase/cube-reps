import { defineOllCase } from './oll-case';

/** OLL 27のケース定義。 */
export const OLL_27_CASE = defineOllCase({
  number: '27',
  names: ['Sune', 'S', 'Swimming Left'],
  group: 'Cross',
  setup: "R U2 R' U' R U' R'",
  algorithms: [
    { id: '1fa15d72-eb68-479e-960c-56ef073ac881', notation: "R U R' U R U2 R'" },
    { id: 'eb394532-9033-43d0-9769-96a801a9bd7f', notation: "(y') R' U2 R U R' U R" },
    { id: '4abcf539-71dc-48d2-8f06-d3cf94e524d2', notation: "(y) L' U2 L U L' U L" },
  ],
});
