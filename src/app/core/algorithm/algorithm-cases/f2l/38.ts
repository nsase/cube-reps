import { defineF2lCase } from './f2l-case';

/** F2L 38のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 38
// CubeRoot D+
export const F2L_38_CASE = defineF2lCase({
  caseId: 'F2L-38',
  number: '38',
  group: 'Pieces in Slot',
  setup: "R U2 R U R' U R U2 R2",
  slots: {
    FR: {
      algorithms: [
        {
          id: '81b93957-50cb-42bb-9095-cad38b4a08fe',
          notation: "R U' R' U' R U R' U2 R U' R'",
        },
        {
          id: '80ab13a7-9f07-4563-b280-2d8d1e0b1109',
          notation: "R U R' U' R U2 R' U' R U R'",
        },
        {
          id: 'fb3e9a16-1cd4-4440-9ccc-4b12a19d1704',
          notation: "R2 U2 R' U' R U' R' U2 R'",
        },
        {
          id: '3d10cf14-78b5-4be0-898d-3e64d50e2f5b',
          notation: "R U' R' U' R U R' U' R U2 R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'a37c0295-9de5-4ae2-83e2-89d8899a2cb5',
          notation: "L' U L U' L' U2 L U' L' U L",
        },
        {
          id: '7a2b023c-57c8-4420-8418-4b6f67ca9504',
          notation: "F R U2 R' U' R U R' U2 F'",
        },
        {
          id: 'bc9de677-f770-4648-9807-80200ce12b2d',
          notation: "L' U2 L' U' L U' L' U2 L2",
        },
        {
          id: '10b76bfe-8b0f-41ae-994a-2d74f041f862',
          notation: "F U' R U2 R' U' R U2 R' F'",
        },
        {
          id: '8ce3b081-4a9b-47dd-8143-cbf8abc9324b',
          notation: "L' U' L U2 L' U L U' L' U' L",
        },
        {
          id: 'f2902d4d-f305-4a56-a817-414297b37db8',
          notation: "L' U2 L U' L' U L U' L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '20578fca-afb3-4208-9dcd-349f2e6f6e9b',
          notation: "L U L' U' L U2 L' U' L U L'",
        },
        {
          id: '0a88bb95-ecf9-4289-8011-2701ee98f46d',
          notation: "L2 U2 L' U' L U' L' U2 L'",
        },
        {
          id: '5aa0a361-0171-4a7a-8165-8769ec34649f',
          notation: "L U' L' U' L U L' U' L U2 L'",
        },
        {
          id: '24c48729-09d6-4842-8bd2-ff868fad88bd',
          notation: "L U' L' U' L U L' U2 L U' L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '0dd76e70-0e74-47c6-9493-b79db0652971',
          notation: "R' U' R U2 R' U R U' R' U' R",
        },
        {
          id: 'b2f73ffc-ac98-4dd6-908c-f7700962ddfb',
          notation: "R' U R U' R' U2 R U' R' U R",
        },
        {
          id: '3ba9fe13-0d49-4c22-96e0-6dea70c0d94d',
          notation: "R' U2 R' U' R U' R' U2 R2",
        },
        {
          id: '17859b6a-9b63-455e-a04b-4d37b5655f9a',
          notation: "R' U2 R U' R' U R U' R' U' R",
        },
      ],
    },
  },
});
