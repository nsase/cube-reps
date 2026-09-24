import { defineF2lCase } from './f2l-case';

export const F2L_06_CASE = defineF2lCase({
  number: '06',
  group: 'Disconnected Pairs',
  setup: "F' U' F U2 F' U F U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'ff6a92a0-5390-4b9c-b39d-8225b3a5ad62',
          notation: "U' Rw U' R' U R U Rw'",
        },
        {
          id: 'e1b2c3d4-f5a6-7890-1234-56789abcdef0',
          notation: "U F' U' F U2 F' U F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'e4625408-426c-43eb-a4b6-64e5590252c9',
          notation: "U L' U' L U2 L' U L",
        },
        {
          id: '94e9f297-afae-4b10-92b9-5e569f0582ea',
          notation: "F2 R U R' U' F2",
        },
        {
          id: '81507f9c-c709-4193-9405-8770b4d27af0',
          notation: "R' F2 R U R' U' F2 U R",
        },
        {
          id: '229d6fc3-e3f0-46d5-bf2a-e86ff825d9c2',
          notation: "U L' U' L U L' U2 L",
        },
        {
          id: '37a22f4c-c19e-4f90-9ab2-14c6aceb6aa7',
          notation: "U L' U' L U' L F' L' F",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '8b92180f-d362-4e94-9d47-cc413f494a4e',
          notation: "U Rw U' Rw' U' L U F L'",
        },
        {
          id: '2bad4651-8850-4fed-93a7-5e85dfa94a9a',
          notation: "U' Lw U' L' U L U Lw'",
        },
        {
          id: 'a93aea5c-a9d6-42ba-83ca-dd45cf18b623',
          notation: "U L F' L' U' L U F L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '4089ba37-f95d-4053-8a2a-a2a9c18e1777',
          notation: "U R' U' R U2 R' U R",
        },
        {
          id: 'b769830d-452a-44a1-9233-4684f1a25ac1',
          notation: "U2 R' F' U' F U2 R",
        },
        {
          id: '1df0ebe8-b1b8-4aae-98e2-50faaa5ce293',
          notation: "U R' U' R U R' U2 R",
        },
      ],
    },
  },
});
