import { defineOllCase } from './oll-case';

/** OLL 50のケース定義。 */
export const OLL_50_CASE = defineOllCase({
  number: '50',
  names: ['Right front squeezy'],
  group: 'Small L Shape',
  setup: "R B' R2 F R2 B R2 F' R",
  algorithms: [
    { id: '75eec235-11c3-4d94-8df8-08f6e5b4a4d0', notation: "Rw' U Rw2 U' Rw2 U' Rw2 U Rw'" },
    { id: '44bdbb49-56ad-40c3-81ce-7c79e6ff424e', notation: "(y2) R' F R2 B' R2 F' R2 B R'" },
  ],
});
