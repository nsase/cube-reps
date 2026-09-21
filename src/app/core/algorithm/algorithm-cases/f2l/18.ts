import { defineF2lCase } from './f2l-case';

/** F2L 18のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 13
// CubeRoot K-
export const F2L_18_CASE = defineF2lCase({
  number: '18',
  group: 'Connected Pairs',
  setup: "R U R' F R' F' R U' R U R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '19c37f79-e052-4f38-9465-94fe255a077a',
          notation: "y' U R' U R U' R' U' R",
        },
        {
          id: 'af0bfc8f-0484-45d3-b42c-56379eede029',
          notation: "M' U' R U R' U2 R U' Rw'",
        },
        {
          id: '1b1fc76d-18d1-43fd-bd73-2958a8a78b6b',
          notation: "R U' R' U R' F R F' R U' R'",
        },
        {
          id: '453224a1-16bd-4451-9b22-b3f96e636789',
          notation: "Dw R' U R U' R' U' R",
        },
        {
          id: 'f43b7999-36da-4e99-b7f2-aad45735b8ea',
          notation: "R U' R' U2 R U' R' U F' U F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '1b401b77-e192-4024-976c-50b388fa1647',
          notation: "U L' U L U' L' U' L",
        },
        {
          id: '358a0697-2b8c-454b-a08d-0b1f49b82126',
          notation: "y' R U' R' U2 R U' R' U F' U F",
        },
        {
          id: '17cfe5a5-dcfc-4bb3-a34f-8f8ab79f1b1e',
          notation: "U L' U L U' L' U L U L' U L",
        },
        {
          id: '1a53636e-b492-42f5-9851-8d6d263bee91',
          notation: "U L F' L2 U' L U L F L'",
        },
        {
          id: '8d084f06-a620-4699-976e-395c090511ab',
          notation: "L' U2 L U2 L' U' L U2 L' U L",
        },
        {
          id: '2c7812de-51e9-491e-8f2b-b2b3e733a1cd',
          notation: "U L2 D' L U' L' D L2",
        },
        {
          id: '72712000-b0ec-4728-a88d-01a6309f2005',
          notation: "U2 L2 U' L U' L' U2 L2",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '57c846f1-0fc4-4924-872b-ffd4acaf778b',
          notation: "Dw L' U L U' L' U' L",
        },
        {
          id: '0c789cc8-5565-49e8-80b0-b51dbf63e611',
          notation: "y U R' U R U' R' U' R",
        },
        {
          id: '8c0ca532-dff0-401c-a75b-7297adb70062',
          notation: "U Fw' L Fw U' Fw' L' Fw",
        },
        {
          id: 'ca7cecca-a5ea-4b39-b5d3-f80df9cb91a1',
          notation: "U L U' L F' L2 U' L U F U L'",
        },
        {
          id: 'bd57799e-72b1-4d29-ba39-bb6c9fd6a4ee',
          notation: "M U' L U L' U2 L U' Lw'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'fec3f545-f574-45f2-89d2-a92a7fdef1c0',
          notation: "U R' U R U' R' U' R",
        },
        {
          id: '5a2bd1d7-b9d5-4290-bc53-f3c9e526955f',
          notation: "U R' U R U' R' U R U R' U R",
        },
        {
          id: '8b25dc53-d763-41e0-8e9e-42f38f38021a',
          notation: "R' U2 R U2 R' U' R U2 R' U R",
        },
        {
          id: '8f058fac-1a65-4671-9a6f-68bd814f8e49',
          notation: "U R2 D' R U' R' D R2",
        },
        {
          id: '39060798-786b-495d-9fa9-9529f29cd7ba',
          notation: "U2 R2 U' R U' R' U2 R2",
        },
      ],
    },
  },
});
