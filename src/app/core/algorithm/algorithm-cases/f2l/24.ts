import { defineF2lCase } from './f2l-case';

/** F2L 24のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 24
// CubeRoot G-
export const F2L_24_CASE = defineF2lCase({
  number: '24',
  group: 'Connected Pairs',
  setup: "R U R' F R U R' U' F'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '97be6820-6e2e-48a7-9c91-6b3021b7296c',
          notation: "F U R U' R' F' R U' R'",
        },
        {
          id: '64b8a72a-20b6-4b1a-adb8-9aeef0f940e6',
          notation: "U' R U R2 F R F' R U' R'",
        },
        {
          id: '5277bb3b-59ed-4035-95d6-c6ca50679ca5',
          notation: "y' R' U' R U2 R' U' R U R' U' R",
        },
        {
          id: '2e5706c7-9d4a-4b5d-9ef4-df7a7c3006a4',
          notation: "U F' L' U L F R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'e407e488-7146-4a59-91e4-688ba8679189',
          notation: "U' L' U L U L' U L U' L' U L",
        },
        {
          id: 'd80ef7df-8b57-43a4-a301-365bf5b80371',
          notation: "U' F' Rw U Rw' U' L' U' L",
        },
        {
          id: '3b99b871-c92e-4540-9748-09f08c212e19',
          notation: "L' U L U L' U' L U2 L' U' L",
        },
        {
          id: '06918ffd-8db1-41d3-92b4-dead6c672707',
          notation: "F U' R U2 R' U R U2 R' F'",
        },
        {
          id: 'fe4de13c-75d3-43ee-a9d6-4bb575d45e06',
          notation: "L' U' L U2 L' U' L U L' U' L",
        },
        {
          id: '9e24967b-b240-4da3-bfac-97e8d0794285',
          notation: "U2 L2 U2 L U L' U L2",
        },
        {
          id: '919db989-5efe-4654-8c69-64baea92fa4e',
          notation: "L' U L2 D L' U2 L D' L'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'abea685c-507a-46d6-a3b3-b3cf75684358',
          notation: "U2 Rw U R' U R U2 B Rw'",
        },
        {
          id: '2cf5f5e8-152d-4af8-8b1b-496f4efeda38',
          notation: "U' L F' L F L2 U L U' L'",
        },
        {
          id: 'fb239a43-4799-4dfc-b03c-22d37787dd92',
          notation: "U2 F U R U' R' F' U2 L U' L'",
        },
        {
          id: '9a37f938-6504-4f35-bedd-e4792272d8b4',
          notation: "y U' R' U R U R' U R U' R' U R",
        },
        {
          id: '3523fc10-ef8b-4a10-b491-2877f7e34ee6',
          notation: "U2 F U R U' R' F' U' L U2 L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '7e0ba9a2-7896-4925-a0d5-2b70905b5762',
          notation: "R' U' R U2 R' U' R U R' U' R",
        },
        {
          id: '77121e4e-acb5-49ec-89a9-dd34faf83e15',
          notation: "U2 R2 U2 R U R' U R2",
        },
        {
          id: '296ff428-6df3-4612-be86-58ee7784edad',
          notation: "R U R' U R U2 R2 U2 R",
        },
        {
          id: '0386e45f-70db-4e98-af4f-c79cc50b2fa4',
          notation: "U' R' U R U R' U R U' R' U R",
        },
        {
          id: 'eed56586-06f2-4663-9505-1d63ea67396e',
          notation: "R' U R2 D R' U2 R D' R'",
        },
      ],
    },
  },
});
