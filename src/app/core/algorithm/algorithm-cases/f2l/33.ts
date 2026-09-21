import { defineF2lCase } from './f2l-case';

/** F2L 33のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 33
// CubeRoot U+
export const F2L_33_CASE = defineF2lCase({
  number: '33',
  group: 'Edge in Slot',
  setup: "R U R' U2 R U R' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'a5c8fe3e-e0d4-462e-a3f6-155bbc3409f8',
          notation: "U' R U' R' U2 R U' R'",
        },
        {
          id: 'e2a6f372-5943-42ae-8311-173cda6fa670',
          notation: "y R' D R U' R' D' R",
        },
        {
          id: 'fe2dea9d-9985-4d07-a242-f59bcf49d083',
          notation: "R U R' U' R U' R' U R U' R'",
        },
        {
          id: '53120964-a406-4b10-8ecf-2f25173c2b2d',
          notation: "U' R U' R' U' R U2 R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '27870573-9c02-47d7-8cd4-ac70ad464548',
          notation: "R' D R U' R' D' R",
        },
        {
          id: '354eac91-12ce-4a12-8909-13122f0a338b',
          notation: "U L' U2 L U' L' U' L",
        },
        {
          id: '7d9405e8-c43c-4dd3-b6be-e5c0f78fdc03',
          notation: "U' L D L' U L D' L'",
        },
        {
          id: '24125294-051b-4c7c-90f0-dda9e354f225',
          notation: "U' L' U' L U2 L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '73f0f06e-9880-4b8d-b987-f829fa74dca3',
          notation: "U' L U' L' U2 L U' L'",
        },
        {
          id: 'bdf51fb9-6790-4f93-8f41-abe19a293949',
          notation: "U' L U' L' U' L U2 L'",
        },
        {
          id: '3231378b-a329-492b-8012-9eaba7b91ced',
          notation: "D' R D R' U R D' R' D",
        },
        {
          id: 'f18aed91-eadf-4bf0-bc23-9999812dd9eb',
          notation: "L U L' U' L U' L' U L U' L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '7e3bc18e-c12f-43a2-b1eb-d00b5a39bf7e',
          notation: "U' R D R' U R D' R'",
        },
        {
          id: '1fb3c016-6efc-4503-9984-b618b7336211',
          notation: "U R' U2 R U' R' U' R",
        },
        {
          id: '650063f0-18c6-4982-99df-dc8afb411110',
          notation: "U' R' U' R U2 R' U' R",
        },
        {
          id: '6f3174b9-e5b6-483d-a817-be6dd08dd92c',
          notation: "U R D R' U' R D' R'",
        },
      ],
    },
  },
});
