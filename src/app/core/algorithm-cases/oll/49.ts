import { defineOllCase } from './oll-case';

/** OLL 49のケース定義。 */
export const OLL_49_CASE = defineOllCase({
  number: '49',
  names: ['Right back squeezy'],
  group: 'Small L Shape',
  setup: "R' F R2 B' R2 F' R2 B R'",
  algorithms: [
    { id: 'fac4fc9b-68bf-4290-a002-4b466096c450', notation: "Rw U' Rw2 U Rw2 U Rw2 U' Rw" },
    { id: '9ac98cb6-2032-4ab7-a714-705f9c6d81e1', notation: "(y2) R B' R2 F R2 B R2 F' R" },
  ],
});
