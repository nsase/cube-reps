import { defineF2lCase } from './f2l-case';

/** F2L 02のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 2
// CubeRoot A-
export const F2L_02_CASE = defineF2lCase({
  number: '02',
  group: 'Easy Inserts',
  setup: "R' F R F'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '5ed38198-0479-4bba-9dd3-edbf2e17c3e0',
          notation: "F R' F' R",
        },
        {
          id: 'e6189f1f-7abe-404f-9494-22be23de4afa',
          notation: "y' U' R' U R",
        },
        {
          id: '48f7f0a8-c390-42ee-92dd-6bcbea2a8967',
          notation: "U' F' U F",
        },
        {
          id: 'b437041d-e542-4521-a949-8aa5a6008a89',
          notation: "y U' L' U L",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '3ed15c9d-4c82-4c00-b937-fce40abf2505',
          notation: "U' L' U L",
        },
        {
          id: 'cf3a06e6-cecf-401b-8716-362fcc374aab',
          notation: "L F' L' F",
        },
        {
          id: '147ec646-b86c-43e0-aed9-220d8cb8d79e',
          notation: "Rw U' Rw' F",
        },
        {
          id: '31c48b2c-7e73-4649-8bb7-ec476946eeb1',
          notation: "U Rw' U' F U F' Rw",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '0f30e560-5d91-4695-b88f-688403760096',
          notation: "Lw U L' U' M'",
        },
        {
          id: '8ea215b1-4500-4903-8e1f-688b709e1270',
          notation: "U' Fw' L Fw",
        },
        {
          id: 'e8e18209-f899-455e-8f51-5081b958e45e',
          notation: "Dw' R' U R",
        },
        {
          id: '40ed5a81-da79-42fd-b66c-cf692eeeffd9',
          notation: "y' U' L' U L",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '6ec15f19-0108-4d39-88bf-fd656c617cb1',
          notation: "U' R' U R",
        },
        {
          id: '81378251-aff1-450f-9d82-ad972e7b163e',
          notation: "R Fw' U' Fw",
        },
        {
          id: 'f64872e9-8876-40e7-b53e-450ce69a599c',
          notation: "U2 R' U2 R",
        },
        {
          id: '52c98494-a48d-4044-869f-df4f22cf8aa4',
          notation: "U R' F' U F U' R",
        },
      ],
    },
  },
});
