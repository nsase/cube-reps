import { defineF2lCase } from './f2l-case';

export const F2L_09_CASE = defineF2lCase({
  caseId: 'F2L-09',
  number: '09',
  group: 'Disconnected Pairs',
  setup: "R U' R' U' R U' R' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'cc3e9e91-513c-43e4-be0a-e27084b73404',
          notation: "U' R U R' U R U R'",
        },
        {
          id: '068dd0cd-034f-4bbe-9274-56d843c0ba75',
          notation: "U2 R U' R' U' R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'c26046a7-f882-4804-a96f-eba9248eb9f5',
          notation: "U L' U L U' F U F'",
        },
        {
          id: '921508d4-d4f0-4b6f-a2e8-46f933b0e725',
          notation: "F U' R U R' U2 F'",
        },
        {
          id: 'dfa670e4-1e86-4b9e-84de-72f4c7271ed9',
          notation: "F' L' U' L U F L' U L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '868b9685-9781-4a7f-992b-01b4c1b22f34',
          notation: "U' L U L' U L U L'",
        },
        {
          id: '18b4f13b-aedd-4381-9690-f3fef9be230a',
          notation: "U2 L U' L' U' L U L'",
        },
        {
          id: '68ba494d-f5d2-4e44-addf-c5ed7cc70655',
          notation: "L U' L' U L U L' U2 L U' L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '061cf989-9f39-44df-8cdc-53ba39ef4917',
          notation: "U R' U R U' Fw R Fw'",
        },
        {
          id: '06a91a14-bd42-48d1-a452-341842d641a5',
          notation: "R2 U' F' U F R2",
        },
      ],
    },
  },
});
