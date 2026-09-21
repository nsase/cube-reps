import { defineF2lCase } from './f2l-case';

/** F2L 04のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 3
// CubeRoot B-
export const F2L_04_CASE = defineF2lCase({
  number: '04',
  group: 'Easy Inserts',
  setup: "F' U F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'b054b565-b5f5-4180-8f34-897a93c06572',
          notation: "F' U' F",
        },
        {
          id: 'c4ca555d-9f80-48e0-b44d-9e19c8877372',
          notation: "y' R' U' R",
        },
        {
          id: '02c3e2aa-4c25-4bbf-bc10-f854adacb6d9',
          notation: "y L' U' L",
        },
        {
          id: 'bbfffd1d-95ef-4c21-8532-3075448913a1',
          notation: "S U R U' R' S'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'd0423916-f84c-4538-9b7d-b365dc7e7d8a',
          notation: "L' U' L",
        },
        {
          id: '9c6ee3e3-7ab2-4a88-b015-380e61c9906b',
          notation: "U2 R' F R U R' F' R",
        },
        {
          id: 'b1db442a-bd86-40c8-9f88-999cb78bb688',
          notation: "y' S U R U' R' S'",
        },
        {
          id: 'f15bbb3c-1477-4048-9ef4-b89aa93be4e5',
          notation: "U S' F U' F' U S",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'b38937ec-1d3a-4444-a416-f04038e4cdc0',
          notation: "y R' U' R",
        },
        {
          id: 'aa1da4ea-4355-44fa-bd08-dd8e19006e09',
          notation: "Fw' L' Fw",
        },
        {
          id: 'b97e3c61-1c6a-4cf2-b3c5-cd0d85c4c855',
          notation: "Fw' Rw' U z",
        },
        {
          id: 'dd60692e-c16e-4a6c-91c7-ee709b39c08b',
          notation: "U' R U B' U' B R'",
        },
        {
          id: '8a6dea1a-2cbc-4b43-90b4-e3223365b76b',
          notation: "S' U L U' L' S",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'e688ef5f-5875-42b5-a7fc-f8aabbee8519',
          notation: "R' U' R",
        },
        {
          id: '0728ba79-7d58-439f-b75d-66bf992b0324',
          notation: "U2 Rw' R' F R F' Rw",
        },
        {
          id: '5c7f30a1-a3b3-4309-b8ab-95da9d4d839f',
          notation: "U S Fw R' Fw' U S'",
        },
        {
          id: '98f09a69-848b-41e8-b85e-422148284c95',
          notation: "U Fw2 F' R' Fw' U S'",
        },
      ],
    },
  },
});
