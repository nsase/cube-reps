import { defineF2lCase } from './f2l-case';

export const F2L_28_CASE = defineF2lCase({
  caseId: 'F2L-28',
  number: '28',
  group: 'Corner in Slot',
  setup: "F' U' F U F' U' F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'e3d2db43-9e3e-498a-a215-d0a6c84a76a9',
          notation: "R U R' U' F R' F' R",
        },
        {
          id: 'da4c0ba6-929c-4c89-a0b5-d4003dfcd422',
          notation: "F' U F U' F' U F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '145a258c-8ffb-485c-9f1a-307a235b101b',
          notation: "L' U L U' L' U L",
        },
        {
          id: '33dc2e49-1e8d-4eae-a049-742ec350ca5b',
          notation: "L' U L2 F' L' F",
        },
        {
          id: 'a633b4b9-a04a-4931-9799-30ab9ec34fb8',
          notation: "F U F' U2 L' U L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '4e4789be-d4f8-4b01-ae66-07dcf83f73fc',
          notation: "L U2 L F' L' F L'",
        },
        {
          id: '78cbb272-9b25-4aab-83b6-4f308b22e53f',
          notation: "L U L' U' Lw U L' U' M'",
        },
        {
          id: 'b7eb7353-63f5-4b0e-80fb-f21895719b0c',
          notation: "L U2 L' U Fw' L Fw",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '6df5b833-3f2a-4f23-b4c3-7248c79f7920',
          notation: "R' U R U' R' U R",
        },
      ],
    },
  },
});
