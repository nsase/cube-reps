import { defineF2lCase } from './f2l-case';

export const F2L_12_CASE = defineF2lCase({
  caseId: 'F2L-12',
  number: '12',
  group: 'Disconnected Pairs',
  setup: "F' U' F U F' U2 F U",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'e17cd379-ee82-4464-9b27-851810ec0f0f',
          notation: "U' R U' R2 F R F' R U' R'",
        },
        {
          id: 'b4dc6902-c66e-4a3d-ac65-3259a17290a6',
          notation: "U' F' U2 F U' F' U F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '60c03127-20d8-41f8-ba28-eec4fdbc071d',
          notation: "U' L' U2 L U' L' U L",
        },
        {
          id: 'f0ec32d9-f075-418f-ade3-2c552185c484',
          notation: "L' U L U' L' U L U' L' U' L",
        },
        {
          id: '97894ce1-c8cc-42e8-b736-9d056ab0c49d',
          notation: "U' L' U2 L2 F' L' F",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'f136d781-55a2-4d24-a0e4-d9822d3e3bfc',
          notation: "U' L F U2 F' L' U' L U L'",
        },
        {
          id: 'ee37d7ee-5550-476e-aaa3-6fd280a6a9c4',
          notation: "U' L U L' U Lw U' Lw' U2 Lw U Lw'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '02decb95-c2e0-4348-8b33-64f2a2909d72',
          notation: "U' R' U2 R U' R' U R",
        },
        {
          id: 'c4d0e0f7-ccb8-4f05-96dc-3334570ebf57',
          notation: "R' U R U' R' U R U' R' U' R",
        },
      ],
    },
  },
});
