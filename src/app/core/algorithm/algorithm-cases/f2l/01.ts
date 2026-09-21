import { defineF2lCase } from './f2l-case';

/** F2L 01のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 1
// CubeRoot A+
export const F2L_01_CASE = defineF2lCase({
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
        {
          id: '390f2270-37f8-4fb6-b506-fe111add1bdb',
          notation: "y' Rw' U' R U M'",
        },
        {
          id: '02ecc6e8-399b-4f7c-991d-5c657a16d0e2',
          notation: "y U F' L F L2 U L",
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
          id: 'e63124a4-b258-4815-85d1-b3621962a606',
          notation: "Dw R U' R'",
        },
        {
          id: '324f0ccc-32f5-41ec-b5a7-8e4995d8a0ea',
          notation: "F' L F L'",
        },
        {
          id: '9e61fc46-7073-473e-9989-4cd9b351d648',
          notation: "y' U R U' R'",
        },
        {
          id: 'e07825ef-07e1-4ff9-8e03-0a1eb189c27f',
          notation: "U F' L F L2 U L",
        },
        {
          id: 'f9e5d3ba-da6d-48b3-98bf-996d8829362d',
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
        {
          id: 'f9e51635-4d86-4177-bbec-291d6e3dbf39',
          notation: "U' Rw U B' U' B Rw'",
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
          id: '318dea59-511b-4264-b286-261b34154670',
          notation: "Dw L U' L'",
        },
        {
          id: '9e3454d4-fd72-47b2-8aec-3b5088e1bc0d',
          notation: "y' U L U' L'",
        },
        {
          id: '9562d2b0-8355-40af-9ae3-838023549b6d',
          notation: "U2 R2 F R F' R",
        },
      ],
    },
  },
});
