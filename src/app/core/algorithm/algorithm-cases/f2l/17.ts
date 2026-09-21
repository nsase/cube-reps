import { defineF2lCase } from './f2l-case';

/** F2L 17のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 14
// CubeRoot K+
export const F2L_17_CASE = defineF2lCase({
  number: '17',
  group: 'Connected Pairs',
  setup: "R U' R' U' R U R' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'f95a31f8-a7db-488d-ab4a-4f6e540c645e',
          notation: "U' R U' R' U R U R'",
        },
        {
          id: 'd18be409-5453-44d3-be4c-f6c79a6f689e',
          notation: "R U2 R' U2 R U R' U2 R U' R'",
        },
        {
          id: 'a8ea7499-2e77-4621-8a8d-a63a1acd9ce8',
          notation: "U' R2 D R' U R D' R2",
        },
        {
          id: '8a197659-db9c-4649-87e5-3c8501e348e5',
          notation: "U2 R2 U R' U R U2 R2",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '09c47a5e-c860-425c-a0cc-80885048c7a9',
          notation: "Dw' L U' L' U L U L'",
        },
        {
          id: '09634c8d-4b30-4082-b8de-39490640b956',
          notation: "y U' L U' L' U L U L'",
        },
        {
          id: 'a0f19a37-34af-49dd-a317-6e737466036d',
          notation: "y' U' R U' R' U R U R'",
        },
        {
          id: '914c8659-bb93-4a11-b511-d96fba8cd461',
          notation: "M' U L' U' L U2 L' U Lw",
        },
        {
          id: '47945003-bb46-4c5e-87fb-f39b7acc262f',
          notation: "L' U L U' L F' L' F L' U L",
        },
        {
          id: '557f7b9c-bb88-4ad3-87a1-50f086f04e15',
          notation: "L' U L U2 L' U L U' F U' F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '8dc942df-29b0-4dca-9833-942084614a07',
          notation: "U' L U' L' U L U L'",
        },
        {
          id: '5b7f58c1-7ee6-4fcb-85cc-1c5d1ef0078e',
          notation: "U' L U' L' U L U' L' U' L U' L'",
        },
        {
          id: '1303d438-2d08-4eb1-9701-e6c9d4f75497',
          notation: "L U2 L' U2 L U L' U2 L U' L'",
        },
        {
          id: '2eb19e27-18eb-471c-ba9d-d5970d104141',
          notation: "U' L2 D L' U L D' L2",
        },
        {
          id: '6d07770b-f369-4c31-9abb-a42f91255b3a',
          notation: "U2 L2 U L' U L U2 L2",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '7cb9177f-84f3-4dc2-8845-d472fbabb429',
          notation: "y U' R U' R' U R U R'",
        },
        {
          id: 'bc0429c5-f606-48ce-9a4f-a4d474d9e0a8',
          notation: "Dw' R U' R' U R U R'",
        },
        {
          id: '2db35409-04d5-4e42-a560-47546b8a7f75',
          notation: "U' Fw R' Fw' U Fw R Fw'",
        },
        {
          id: '04466398-9ca8-4f77-881a-850155c47e8d',
          notation: "y' U' L U' L' U L U L'",
        },
        {
          id: 'c4152f3f-aa51-4b59-9eb2-b235e39f1972',
          notation: "M U R' U' R U2 R' U Rw",
        },
      ],
    },
  },
});
