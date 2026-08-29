import { defineOllCase } from './oll-case';

/** OLL 18のケース定義。 */
export const OLL_18_CASE = defineOllCase({
  number: '18',
  names: ['Crown'],
  group: 'Dot',
  setup: "F R' F' R U2 R' U' F' U F R2 U' R' U2",
  algorithms: [
    {
      id: '39179d8d-7117-46c7-b96d-81f35b688f54',
      notation: "Rw U R' U R U2 Rw2 U' R U' R' U2 Rw",
    },
    {
      id: 'c9592422-7f49-4c09-9bf3-be68d12fcbc6',
      notation: "(y) R U2 R2 F R F' U2 M' U R U' Rw'",
    },
    {
      id: '8d71e401-29ac-40dd-ae46-20064e22c14e',
      notation: "(y2) R U R2 F' U' F U R U2 R' F R F'",
    },
    { id: '97bf7943-3653-4b7b-be4f-3bf3380a5d96', notation: "(y2) F R U R' Dw R' U2 R' F R F'" },
  ],
});
