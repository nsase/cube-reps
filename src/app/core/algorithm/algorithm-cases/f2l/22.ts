import { defineF2lCase } from './f2l-case';

/** F2L 22のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 18
// CubeRoot H-
export const F2L_22_CASE = defineF2lCase({
  number: '22',
  group: 'Connected Pairs',
  setup: "F' U F U' F' U2 F",
  slots: {
    FR: {
      algorithms: [
        {
          id: '84d33de0-0a1d-4dd4-be39-45a1b98e5e5b',
          notation: "y' R' U2 R U R' U' R",
        },
        {
          id: '7af465e2-9ef5-436b-975a-20663c099fc0',
          notation: "y L' U2 L U L' U' L",
        },
        {
          id: '4152a068-a3dc-4d91-b065-3bfb5adc6296',
          notation: "F' U2 F U F' U' F",
        },
        {
          id: '61e788bf-c154-4d8d-9a3c-438e021b0ba8',
          notation: "R' F R F' R U' R' U R U' R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'f25dedc4-37b1-4252-952b-6c2e7a2bb33d',
          notation: "L' U2 L U L' U' L",
        },
        {
          id: '9984a886-1e89-4f43-b015-b923c160cd06',
          notation: "L' U' L U L' U2 L U2 L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'b5e2eaf2-6c8a-4e9d-9405-6d9b3d16c8a2',
          notation: "y R' U2 R U R' U' R",
        },
        {
          id: 'a7477d7e-c187-451f-9e78-6605311b1c67',
          notation: "U F U R U' R' F' L U L'",
        },
        {
          id: '080de75f-eed3-4081-af72-8b5cd8dd674b',
          notation: "L U2 F' L' U' L U F L'",
        },
        {
          id: 'ef330ac2-e2d2-4d51-81f4-75712ca2fc32',
          notation: "L U2 L' U2 Lw U' L' U L U Lw'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '93376e2d-c3f4-4b7e-8d47-4724dd6ff986',
          notation: "R' U2 R U R' U' R",
        },
        {
          id: '26ca71b1-5590-43e3-abdf-338ca5fa525c',
          notation: "R' U' R U R' U2 R U2 R' U' R",
        },
      ],
    },
  },
});
