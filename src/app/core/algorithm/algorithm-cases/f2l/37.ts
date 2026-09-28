import { defineF2lCase } from './f2l-case';

export const F2L_37_CASE = defineF2lCase({
  caseId: 'F2L-37',
  number: '37',
  group: 'Pieces in Slot',
  setup: "R U' R U2 F R2 F' U2 R2",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd718945e-f5e8-43fe-8343-f601c1cfd6bd',
          notation: "R2 U2 F R2 F' U2 R' U R'",
        },
        {
          id: 'e1277f9b-1ce4-4c75-9df9-154fe9ea9bb4',
          notation: "R' F R F' R U' R' U R U' R' U2 R U' R'",
        },
        {
          id: 'e48e0a05-ef4b-45bf-a4d2-54fc6475cb36',
          notation: "R U2 R' U R U2 R' U F' U' F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '7699343f-211b-401d-8581-76fe12f83f01',
          notation: "L2 U2 F' L2 F U2 L U' L",
        },
        {
          id: '704fec16-4fff-4b7e-a4f0-d0bb9ddea5a3',
          notation: "L' U2 L U' L' U2 L U' F U F'",
        },
        {
          id: '6e973a3d-a3d8-430a-a103-e9e477af602b',
          notation: "R' F R L' U' L U' R' F R L' U' L",
        },
        {
          id: 'a69ec734-609d-425f-9ca7-be2b73c0fee4',
          notation: "L F' L' F L' U L U' L' U L U2 L' U L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '1c80c0b2-060e-408b-a69d-587dcb926a1e',
          notation: "L U' L' Lw' U2 L2 U L2 U Lw",
        },
        {
          id: '8e05cb79-ae88-4064-afb8-9507d1f18124',
          notation: "Fw' L Fw U' L U2 L' U2 L U' L'",
        },
        {
          id: '843bedbe-d29d-4f15-b17d-df26c70d60ae',
          notation: "L U2 L' U L U2 L' U Fw' L' Fw",
        },
        {
          id: 'c62170c3-366c-4226-9d45-a3e664a2beee',
          notation: "L' Fw U Fw' L' U2 L2 U L2 U L",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'b7dfd904-0fcd-4bf3-86e8-ece158111470',
          notation: "R' U R Rw U2 R2 U' R2 U' Rw'",
        },
        {
          id: '2905da67-2a79-4103-beae-95f8b1d18881',
          notation: "R' U2 R U' R' U2 R U' Fw R Fw'",
        },
        {
          id: '3b813eda-8568-469a-a02a-eab3134e9e5d',
          notation: "R' U R Fw R U R2 U' R Fw'",
        },
        {
          id: '97629dcf-4382-4699-8c0c-5a703aa348e2',
          notation: "R' U' R U2 R' U2 R U' Fw R Fw'",
        },
      ],
    },
  },
});
