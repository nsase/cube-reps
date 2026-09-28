import { defineF2lCase } from './f2l-case';

export const F2L_01_CASE = defineF2lCase({
  caseId: 'F2L-01',
  number: '01',
  group: 'Easy Inserts',
  setup: "R U R' U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'fef0ef90-e57b-4f15-ac02-7504c0abba50',
          notation: "U R U' R'",
        },
        {
          id: 'b1f52af8-c69d-418b-bd11-0b13b20cabee',
          notation: "R' F R F'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'f5083f12-e2e5-4be8-b32d-db1c2caa2597',
          notation: "F' Rw U Rw'",
        },
        {
          id: '324f0ccc-32f5-41ec-b5a7-8e4995d8a0ea',
          notation: "F' L F L'",
        },
        {
          id: 'e63124a4-b258-4815-85d1-b3621962a606',
          notation: "U F U' F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '357e0916-20f2-450f-a592-1c50a4a922cb',
          notation: "U L U' L'",
        },
        {
          id: '761fae78-00ab-4bc8-ac5c-c506072b2484',
          notation: "L' Fw U Fw'",
        },
        {
          id: 'ab591c73-6a06-4893-a1c4-6e2165900a0e',
          notation: "U2 L U2 L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '1c9188dd-512a-44aa-8fa3-52df798f0fe3',
          notation: "U Fw R' Fw'",
        },
        {
          id: '40d93f36-c73d-47f5-b595-6e2c161ed68b',
          notation: "Rw' U' R U M'",
        },
        {
          id: '9562d2b0-8355-40af-9ae3-838023549b6d',
          notation: "U2 R2 F R F' R",
        },
      ],
    },
  },
});
