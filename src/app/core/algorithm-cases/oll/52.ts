import { defineOllCase } from './oll-case';

/** OLL 52のケース定義。 */
export const OLL_52_CASE = defineOllCase({
  number: '52',
  names: ['Rice Cooker'],
  group: 'I Shape',
  setup: "R B U B' U R' U' R U' R'",
  algorithms: [
    { id: 'b5fba15b-8986-4e32-8a12-f36c22e9074c', notation: "R U R' U R U' B U' B' R'" },
    { id: 'f976a86c-abb7-4b94-bfc4-cbf096144604', notation: "(y2) R' F' U' F U' R U R' U R" },
    { id: '4e6a89b7-45a4-462a-80a4-e7e0fbae47f2', notation: "R U R' U R U' y R U' R' F'" },
  ],
});
