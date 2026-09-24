import { defineF2lCase } from './f2l-case';

export const F2L_40_CASE = defineF2lCase({
  number: '40',
  group: 'Pieces in Slot',
  setup: "R U' R' F' L' U2 L F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd46a8ac0-e558-456b-8e43-5f8478c33271',
          notation: "Rw U' Rw' U2 Rw U Rw' R U R'",
        },
        {
          id: '352eaf09-f767-4e51-a1ff-aeec248a8916',
          notation: "F' L' U2 L F R U R'",
        },
        {
          id: '1a93f677-e601-4af4-8843-77f936a159ae',
          notation: "R U' R' F R U R' U' F' R U' R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '8d073ffe-dfca-4b79-a2a1-db7b5c7ee70e',
          notation: "L' U L F R U2 R' F'",
        },
        {
          id: '98fad367-e594-4eb4-a7ac-db599a89db8d',
          notation: "L' U L Lw' U Lw U2 Lw' U' Lw",
        },
        {
          id: 'adbc90f2-ca52-4798-9656-e7c12107b7fc',
          notation: "L' U L R' F R U2 R' F' R",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '4f0eda74-4525-4338-b9e6-d8377abe7889',
          notation: "Lw U' Lw' U2 Lw U Lw' L U L'",
        },
        {
          id: '9553c520-640d-4d0a-9f7a-f2490aea2620',
          notation: "Fw' L Fw L F U2 F' L'",
        },
        {
          id: 'dff59620-a90a-459e-a03c-b1afe23e7ba9',
          notation: "Fw' L Fw U2 L U L' U L U' L'",
        },
        {
          id: 'b2750e7a-e913-4367-a945-5451bcb5d1ab',
          notation: "Fw' L Fw U2 L U L' U2 L U2 L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'fc5acdf5-a5a6-40a4-bb80-e2b0376a4162',
          notation: "R' U R Rw' U Rw U2 Rw' U' Rw",
        },
        {
          id: 'e3a5b9c8-7f5d-446a-a34d-cf070bff97e9',
          notation: "R' F' U2 F R Fw R Fw'",
        },
        {
          id: 'e113fa89-e443-450b-8d14-0d04b8eb9ccd',
          notation: "R' U R Fw U R2 U' Fw'",
        },
        {
          id: '7cd1bea0-6190-49c0-bf94-c642b13bd994',
          notation: "R2 F' U' F U R U' R",
        },
      ],
    },
  },
});
