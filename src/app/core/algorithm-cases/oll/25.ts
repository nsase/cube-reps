import { defineOllCase } from './oll-case';

/** OLL 25のケース定義。 */
export const OLL_25_CASE = defineOllCase({
  number: '25',
  names: ['L', 'Bowtie', 'Triple-Sune', 'Side-winder', 'Diagonals', 'Spaceship'],
  group: 'Cross',
  setup: "B' R' F R B R' F' R",
  algorithms: [
    { id: '6b956ab3-e3a1-4baa-803f-929c61a71556', notation: "F' Rw U R' U' Rw' F R" },
    { id: 'e85edb79-132b-44b5-accb-fd1347fa611f', notation: "(y') x R' U R D' R' U' R D x'" },
    { id: '13561d19-b398-410f-9094-bc2b4028ab9e', notation: "(y2') x' R U' R' D R U R' D' x" },
    { id: 'f37a380e-42e5-401d-b4bc-8cdfb92e8691', notation: "(y') R' F R B' R' F' R B" },
    { id: '1055a79c-032a-40ce-b659-0573ec70dac1', notation: "(y') F R' F' Rw U R U' Rw'" },
    { id: 'afd51660-d369-4f2d-938e-719e3e2fab8d', notation: "(y) F R B R' F' R B' R'" },
    { id: '70c0fb21-5538-48b0-b319-75da8cfe3154', notation: "(y) F Lw U Lw' F' Lw U' Lw'" },
  ],
});
