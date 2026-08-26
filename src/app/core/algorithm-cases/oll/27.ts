import { defineOllCase } from './oll-case';

/** OLL 27のケース定義。 */
export const OLL_27_CASE = defineOllCase({
  number: '27',
  names: ['Sune', 'S', 'Swimming Left'],
  group: 'Cross',
  algorithms: [
    { id: '1fa15d72-eb68-479e-960c-56ef073ac881', notation: "R U R' U R U2 R'" },
    { id: 'eb394532-9033-43d0-9769-96a801a9bd7f', notation: "(y') R' U2 (R U R' U) R" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'none'],
    ['none', 'none', 'none', 'yellow', 'none'],
  ],
});
