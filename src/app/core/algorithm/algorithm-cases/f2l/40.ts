import { defineF2lCase } from './f2l-case';

/** F2L 40のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 40
// CubeRoot C+
export const F2L_40_CASE = defineF2lCase({
  number: '40',
  group: 'Pieces in Slot',
  setup: "R U' R' F' L' U2 L F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd46a8ac0-e558-456b-8e43-5f8478c33271',
          notation: "Rw U' Rw' U2 Rw U Rw' R U R'",
        },
        {
          id: '352eaf09-f767-4e51-a1ff-aeec248a8916',
          notation: "F' L' U2 L F R U R'",
        },
        {
          id: '1a93f677-e601-4af4-8843-77f936a159ae',
          notation: "R U' R' F R U R' U' F' R U' R'",
        },
        {
          id: '16c6d87e-e886-4d5c-9dd0-98c67b86cd72',
          notation: "R U' R' U' R U' R' U y' R' U' R",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '8d073ffe-dfca-4b79-a2a1-db7b5c7ee70e',
          notation: "L' U L F R U2 R' F'",
        },
        {
          id: '98fad367-e594-4eb4-a7ac-db599a89db8d',
          notation: "L' U L Lw' U Lw U2 Lw' U' Lw",
        },
        {
          id: 'adbc90f2-ca52-4798-9656-e7c12107b7fc',
          notation: "L' U L R' F R U2 R' F' R",
        },
        {
          id: 'ec60a4b0-bc1f-4559-aeed-6916c12b8932',
          notation: "L' U L U2 y L U L' U L U' L'",
        },
        {
          id: '70607a66-4884-4c37-8dde-da946fd689bc',
          notation: "L' U' L U y' M U L F' L' U' M'",
        },
        {
          id: '8fc55d57-4488-495c-b80c-c989480c1424',
          notation: "L' U' L U L' U L U2 y L U L'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '4f0eda74-4525-4338-b9e6-d8377abe7889',
          notation: "Lw U' Lw' U2 Lw U Lw' L U L'",
        },
        {
          id: '9553c520-640d-4d0a-9f7a-f2490aea2620',
          notation: "Fw' L Fw L F U2 F' L'",
        },
        {
          id: 'dff59620-a90a-459e-a03c-b1afe23e7ba9',
          notation: "Fw' L Fw U2 L U L' U L U' L'",
        },
        {
          id: 'b2750e7a-e913-4367-a945-5451bcb5d1ab',
          notation: "Fw' L Fw U2 L U L' U2 L U2 L'",
        },
        {
          id: 'ea2d9ba7-baa2-4f9b-b07d-4fb1e0c48c9b',
          notation: "L U' L' U' L U' L' U y' L' U' L",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'fc5acdf5-a5a6-40a4-bb80-e2b0376a4162',
          notation: "R' U R Rw' U Rw U2 Rw' U' Rw",
        },
        {
          id: 'e3a5b9c8-7f5d-446a-a34d-cf070bff97e9',
          notation: "R' F' U2 F R Fw R Fw'",
        },
        {
          id: 'e113fa89-e443-450b-8d14-0d04b8eb9ccd',
          notation: "R' U R Fw U R2 U' Fw'",
        },
        {
          id: '7cd1bea0-6190-49c0-bf94-c642b13bd994',
          notation: "R2 F' U' F U R U' R",
        },
        {
          id: 'aa206795-d52a-44b4-a3a0-0be8b8c62458',
          notation: "R' U' R U R' U R U2 y R U R'",
        },
      ],
    },
  },
});
