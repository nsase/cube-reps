import { defineF2lCase } from './f2l-case';

/** F2L 39のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 39
// CubeRoot D-
export const F2L_39_CASE = defineF2lCase({
  number: '39',
  group: 'Pieces in Slot',
  setup: "R2 U2 R' U' R U' R' U2 R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '2bc29fca-3a7d-47d1-a3a7-111c833d8922',
          notation: "R U' R' U R U2 R' U R U' R'",
        },
        {
          id: '769a4ed6-9ac6-4ce1-ae3b-fe3cbdcf0657',
          notation: "R U2 R U R' U R U2 R2",
        },
        {
          id: '61495f63-cbc1-4406-aa9a-fc86252facfc',
          notation: "R U R' U2 R U' R' U R U R'",
        },
        {
          id: 'd13f44c2-6ae7-47f8-b94f-4fbd9863c2ca',
          notation: "R U2 R' U R U' R' U R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'baa730bb-46d4-46aa-80d8-df70d8affa69',
          notation: "L' U' L U L' U2 L U L' U' L",
        },
        {
          id: '0bb76daa-ba41-4001-984c-996d71abe89f',
          notation: "F' L F L2 U2 L U L' U' L",
        },
        {
          id: '5106c58f-984f-4a4d-a5a1-576415e2d8c9',
          notation: "L' U L U L' U' L U2 L' U L",
        },
        {
          id: '79584290-6174-411a-a343-2d1f7a381ba6',
          notation: "F U2 R U' R' U R U2 R' F'",
        },
        {
          id: '1897fe85-9c9f-4f57-9ee6-11a9830b43be',
          notation: "L2 U2 L U L' U L U2 L",
        },
        {
          id: '02733c68-f685-4f7e-b045-b2aa4de88243',
          notation: "L' U L U L' U' L U L' U2 L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '9d8fc9c6-b235-41dd-ad91-a5e95334ff48',
          notation: "L U L' U2 L U' L' U L U L'",
        },
        {
          id: 'f58b5830-2c34-4284-a778-61f2cf8fbe05',
          notation: "L U' L' U L U2 L' U L U' L'",
        },
        {
          id: 'd8ec84ce-0ac1-4599-bfac-817b6aaa7ce5',
          notation: "L U2 L' U L U' L' U L U L'",
        },
        {
          id: '8b8f4f5d-b08e-42ce-aae2-9b42f896a4b5',
          notation: "L U2 L U L' U L U2 L2",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '6f4ace55-bcd4-411e-9eb5-bea2c68291c0',
          notation: "R' U' R U R' U2 R U R' U' R",
        },
        {
          id: '0fe094a6-5c44-4da4-a34c-479114d5df76',
          notation: "R' U R U R' U' R U2 R' U R",
        },
        {
          id: 'a7bebc33-23d3-4d7b-8422-c47bc9ea9711',
          notation: "Fw R2 U R' U' F R' Fw' U F'",
        },
        {
          id: '345ecc50-3ce3-466d-8877-b67110b1da2c',
          notation: "R2 U2 R U R' U R U2 R",
        },
        {
          id: '381ce6b1-b3c3-4c34-87f3-4683157ad8e8',
          notation: "R' U R U R' U' R U R' U2 R",
        },
      ],
    },
  },
});
