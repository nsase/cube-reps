import { defineF2lCase } from './f2l-case';

/** F2L 32のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 32
// CubeRoot S
export const F2L_32_CASE = defineF2lCase({
  number: '32',
  group: 'Edge in Slot',
  setup: "R U' R' U R' F R F' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'f91f2fe6-493f-4703-85be-326dda1529fc',
          notation: "U R U' R' U R U' R' U R U' R'",
        },
        {
          id: '1f1108bb-52d0-428c-8aa9-7b1e9773ebfc',
          notation: "R U R' U' R U R' U' R U R'",
        },
        {
          id: '58896c5e-55a9-4e94-a238-d697369f77ed',
          notation: 'R2 U R2 U R2 U2 R2',
        },
        {
          id: '60fa24c4-36c8-47f9-8bb6-135c3f6efccd',
          notation: "U' F R' F' R U' R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'a73beb3f-f086-4426-9a70-12fc5bfe49cf',
          notation: "U' L' U L U' L' U L U' L' U L",
        },
        {
          id: 'f99c190f-2355-4907-a963-faaba930b29b',
          notation: "U L' U L U' L' U2 L U L' U' L",
        },
        {
          id: '41d28b84-2096-45a1-9c53-892a4db99fe0',
          notation: "U2 F U' R U R' U F'",
        },
        {
          id: '0b96d219-553a-4aa8-bde0-bee63b823142',
          notation: "L' U' L U L' U' L U L' U' L",
        },
        {
          id: '9bf1b7c0-4b70-4759-84de-09cf340f39c3',
          notation: "L2 U' L2 U' L2 U2 L2",
        },
        {
          id: '180a5be4-b8c7-4ccc-a7b2-a0548e5bec9e',
          notation: "U F' L F L' U L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'dcb970d2-9280-4ee2-b1a2-b094c8831715',
          notation: "L U L' U' L U L' U' L U L'",
        },
        {
          id: 'ef2da459-1794-4ae8-b71b-1597c0f2d9e9',
          notation: "U L U' L' U L U' L' U L U' L'",
        },
        {
          id: 'f8b0a547-a3c5-4854-a5a3-5ff8380b11a8',
          notation: 'L2 U L2 U L2 U2 L2',
        },
        {
          id: 'f8116750-d233-4179-84ef-1911b1c84470',
          notation: "U' L U' L' U L U2 L' U' L U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'aa60ce27-4612-4f8e-90bc-c422598c37f8',
          notation: "U' R' U R U' R' U R U' R' U R",
        },
        {
          id: '3a3fd0ef-082d-4174-9198-5c253c383b93',
          notation: "R' U' R U R' U' R U R' U' R",
        },
        {
          id: '5d39bf88-df84-4d8d-ab03-ddf8cbf7c7f6',
          notation: "U2 Fw R' U R U' R Fw'",
        },
        {
          id: 'bd267f48-e9e8-4ebf-8d83-1b7004cb9043',
          notation: "R2 U' R2 U' R2 U2 R2",
        },
      ],
    },
  },
});
