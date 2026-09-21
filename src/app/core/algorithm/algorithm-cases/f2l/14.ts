import { defineF2lCase } from './f2l-case';

/** F2L 14のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 22
// CubeRoot P-
export const F2L_14_CASE = defineF2lCase({
  number: '14',
  group: 'Disconnected Pairs',
  setup: "F' L' U2 L F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd7f0d5c2-9653-497f-9818-823a22ef61fe',
          notation: "Rw U' Rw' U2 Rw U Rw'",
        },
        {
          id: 'c3335acb-5e75-4519-b15f-69d60fb918cb',
          notation: "F' L' U2 L F",
        },
        {
          id: '5ff3f369-1d84-4927-8e1d-63cac51f91fb',
          notation: "y' U2 R' U' R U' R' U R",
        },
        {
          id: 'd234a284-bfae-4fdf-9585-0f0d3e61ed5c',
          notation: "y U2 L' U' L U' L' U L",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '6f7212ba-f70d-4954-af73-88df91b2b4b7',
          notation: "L' U L U2 L' U' L",
        },
        {
          id: '2820bed8-c9af-4635-865d-533ad22db5e7',
          notation: "U2 L' U' L U' L' U L",
        },
        {
          id: '994e6d5a-3b63-4e99-a749-6ca84f1c2b22',
          notation: "Rw' U' F2 U Rw",
        },
        {
          id: 'fbf7681a-8e42-4960-81d2-3a086e9ec94e',
          notation: "U' L' U L U2 L' U L U' L' U L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '5b2b5d79-47ee-45ca-b26d-23b4e07694c0',
          notation: "Lw U' Lw' U2 Lw U Lw'",
        },
        {
          id: '8b1edff4-d519-48b5-9252-952642f66a51',
          notation: "Fw' U' L2 U Fw",
        },
        {
          id: '557bf1ac-af35-441b-827d-92c8d8435190',
          notation: "y R' U R U2 R' U' R",
        },
        {
          id: '258a994c-25f8-42d1-8fe8-9fa1bb17f938',
          notation: "y U2 R' U' R U' R' U R",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'b00aec76-4950-4cd5-ad43-5eafe1fee507',
          notation: "R' U R U2 R' U' R",
        },
        {
          id: 'faba9fbc-1fe4-45e1-90cd-e88501a317ec',
          notation: "U2 R' U' R U' R' U R",
        },
        {
          id: 'ec726846-33d0-441a-8d29-fb8f692a4194',
          notation: "R' F' U2 F R",
        },
        {
          id: '6d9b7619-c2ea-4579-9e19-694071713c19',
          notation: "U' R' U R U2 R' U R U' R' U R",
        },
      ],
    },
  },
});
