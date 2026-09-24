import { defineF2lCase } from './f2l-case';

export const F2L_23_CASE = defineF2lCase({
  number: '23',
  group: 'Connected Pairs',
  setup: "R' D' R U2 R' D R2 U R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '5555d95e-93ee-4cde-bc01-062927a7ec5a',
          notation: "U R U' R' U' R U' R' U R U' R'",
        },
        {
          id: 'eaf8f6db-f157-47b7-9507-3c9767fdaef6',
          notation: "R U R' U2 R U R' U' R U R'",
        },
        {
          id: '16a9bb9b-2229-4a2d-9e2a-6c7dff2735cc',
          notation: "U2 R2 U2 R' U' R U' R2",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '4436bbd9-e436-428c-894f-b118ae4984e2',
          notation: "F' U' L' U L F L' U L",
        },
        {
          id: '607e7dea-397d-4904-bca8-e151a069cd43',
          notation: "U L' U' L2 F' L' F L' U L",
        },
        {
          id: '4d6731d2-6c17-4d80-a08b-6f1f278b1663',
          notation: "F U' R U R' U R U2 R' F'",
        },
        {
          id: 'd9f5802d-89eb-46bf-8133-4fb619396412',
          notation: "U' F R U' R' F' L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'b7e9f4e5-b983-450f-8521-69b2b9b90371',
          notation: "U L U' L' U' L U' L' U L U' L'",
        },
        {
          id: '402eb57c-e3c0-45a6-a531-3b1e1dfcf05c',
          notation: "L U L' U2 L U L' U' L U L'",
        },
        {
          id: '2f887ae3-b252-406c-a211-a88241320eeb',
          notation: "L' U' L U' L' U2 L2 U2 L'",
        },
        {
          id: 'c8f6f546-9687-4955-83c7-65253be4d30e',
          notation: "U2 L2 U2 L' U' L U' L2",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '346b317e-9be1-4a34-97a7-e779b012d93f',
          notation: "U R' F R' F' R2 U' R' U R",
        },
        {
          id: 'be2cef8a-fb9e-4b00-bbaa-ad5395550b67',
          notation: "R' F' U' F U2 R U' R' U' R",
        },
        {
          id: 'dd928fc8-8960-4704-b9f4-1bde2b5be3a4',
          notation: "U R' U' F' U F R U' R' U R",
        },
      ],
    },
  },
});
