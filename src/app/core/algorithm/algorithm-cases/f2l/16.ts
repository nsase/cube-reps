import { defineF2lCase } from './f2l-case';

export const F2L_16_CASE = defineF2lCase({
  caseId: 'F2L-16',
  number: '16',
  group: 'Connected Pairs',
  setup: "F' U2 L' U2 L U' F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd408692c-ffa8-4d2c-a4b7-73f3f08b15c5',
          notation: "U' R U2 R' U F' U' F",
        },
        {
          id: 'c26d6ae9-9131-4896-8b05-fc79d05ff454',
          notation: "F' U L' U2 L U2 F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'fc789d7a-d03c-4392-a074-5c62e33740fe',
          notation: "L' U L U' L' U L U2 L' U L",
        },
        {
          id: '89889ff8-11d2-40ec-853c-b67446c42162',
          notation: "L U2 L2 U' L2 U' L'",
        },
        {
          id: '30d86ac7-1bd4-4eed-9023-4339853fba5d',
          notation: "F U R U' R' U R U' R' U F'",
        },
        {
          id: '1203e770-2a0b-4c0f-b510-a0a1754076fa',
          notation: "U' F U2 F' U Rw' F' Rw",
        },
        {
          id: '1a7f8ee5-a7ee-4b5a-b74f-4e49faa20e7b',
          notation: "U' L' U L U L' U' L U L' U' L",
        },
        {
          id: '1ff7a967-0ada-4f6f-93ec-61ce9195f7d6',
          notation: "L' U L U' L' U L U L' U2 L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '2a01da21-9705-4446-8d86-86391e0375e8',
          notation: "U' L U2 L' U Fw' L' Fw",
        },
        {
          id: '11c029c5-e6f4-4da1-bf74-cbddefaca7b6',
          notation: "L U2 L' U' Lw U' Lw' U2 Lw U Lw'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '96b94c53-8b53-4ce9-88de-190fa74b8faf',
          notation: "R U2 R2 U' R2 U' R'",
        },
        {
          id: '1cea39ea-d632-4f74-98c6-54923f6243bc',
          notation: "R' U R U' R' U R U2 R' U R",
        },
        {
          id: 'b19cd8f3-10a7-4bb9-a4bf-6bbae68468e7',
          notation: "R' U R U' R' U R U R' U2 R",
        },
        {
          id: '3b25b3c1-3b06-4a58-a419-ca20d1ca03d7',
          notation: "U' R' U R U R' U' R U R' U' R",
        },
      ],
    },
  },
});
