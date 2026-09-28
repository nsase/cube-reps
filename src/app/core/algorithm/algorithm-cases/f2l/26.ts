import { defineF2lCase } from './f2l-case';

export const F2L_26_CASE = defineF2lCase({
  caseId: 'F2L-26',
  number: '26',
  group: 'Corner in Slot',
  setup: "F' U' F U R U R' U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '081576e2-b4b9-48aa-b204-64edd2e4af06',
          notation: "U R U' R' F R' F' R",
        },
        {
          id: 'df5ccf9e-acc8-45b2-8248-16399b4851df',
          notation: "U R U' R' U' F' U F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'ccabd016-f06c-4cd4-a5ef-ff2f654d1e6e',
          notation: "Rw U Rw' U' Rw' F Rw F'",
        },
        {
          id: '3864151d-9b74-4af3-8415-bfe0013da0b6',
          notation: "U L F' L' F L' U' L",
        },
        {
          id: '3a3292df-edc7-4366-8bfa-2a6472d4f674',
          notation: "U F L' U' L U L F' L'",
        },
        {
          id: '1d6b39a8-28d5-4baf-adea-f94bb8cc1f01',
          notation: "U F Rw' F' Rw U Rw U' Rw'",
        },
        {
          id: 'b109abe7-f51c-442f-9ee9-e8b2e30b20f8',
          notation: "L F L' U' L' U L F'",
        },
        {
          id: '95b477b8-f10f-4d9f-9845-458aa615d2f4',
          notation: "U F U' F' U' L' U L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'f3485d16-5b2f-4926-8a41-3d5465d15815',
          notation: "F R2 Uw R Uw' R2 F'",
        },
        {
          id: 'd810fe28-3a66-45d0-b0ee-1b80086d02e1',
          notation: "U' R Uw R' U R U' Uw' R'",
        },
        {
          id: '1460914f-a1d4-48b4-b12f-b5527dfe9a1a',
          notation: "U L U' M U L' U' M'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '3f03107c-f9fc-48b1-996f-a76dfe6a2aaf',
          notation: "U Fw R Fw' U' R' U' R",
        },
        {
          id: 'cdc8af91-77d0-460f-bdcf-f05c346a1b7c',
          notation: "R' U R U R' U R U' R' U' R",
        },
        {
          id: 'a2201956-6f6b-42b0-899d-86042b30d2fd',
          notation: "R U R U R U' R' U' R'",
        },
      ],
    },
  },
});
