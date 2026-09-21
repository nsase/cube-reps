import { defineF2lCase } from './f2l-case';

/** F2L 09のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 10
// CubeRoot R+
export const F2L_09_CASE = defineF2lCase({
  number: '09',
  group: 'Disconnected Pairs',
  setup: "R U' R' U' R U' R' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'cc3e9e91-513c-43e4-be0a-e27084b73404',
          notation: "U' R U R' U R U R'",
        },
        {
          id: '068dd0cd-034f-4bbe-9274-56d843c0ba75',
          notation: "U2 R U' R' U' R U R'",
        },
        {
          id: '7f7efe0f-a223-4aa3-8da3-a65b5dec83e9',
          notation: "Dw R' U R Dw' R U R'",
        },
        {
          id: 'a97a4827-bf5e-43f3-a27f-17ea96a09284',
          notation: "y' U R' U R U' Fw R Fw'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'c26046a7-f882-4804-a96f-eba9248eb9f5',
          notation: "U L' U L U' F U F'",
        },
        {
          id: '921508d4-d4f0-4b6f-a2e8-46f933b0e725',
          notation: "F U' R U R' U2 F'",
        },
        {
          id: 'e329689d-d201-4154-833e-42bdf16b47e6',
          notation: "Dw' L U L' U L U L'",
        },
        {
          id: '48eeed16-0377-40d1-a610-357cb241c6bb',
          notation: "y' U' R U R' U R U R'",
        },
        {
          id: 'dfa670e4-1e86-4b9e-84de-72f4c7271ed9',
          notation: "F' L' U' L U F L' U L",
        },
        {
          id: '192759ab-3b9a-4b56-a319-684ef1200878',
          notation: "U L' U L Dw' L U L'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '868b9685-9781-4a7f-992b-01b4c1b22f34',
          notation: "U' L U L' U L U L'",
        },
        {
          id: '18b4f13b-aedd-4381-9690-f3fef9be230a',
          notation: "U2 L U' L' U' L U L'",
        },
        {
          id: '68ba494d-f5d2-4e44-addf-c5ed7cc70655',
          notation: "L U' L' U L U L' U2 L U' L'",
        },
        {
          id: '10db5795-d534-40d1-8ee8-1239f3578688',
          notation: "y2 U' R U R' U R U R'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '061cf989-9f39-44df-8cdc-53ba39ef4917',
          notation: "U R' U R U' Fw R Fw'",
        },
        {
          id: '06a91a14-bd42-48d1-a452-341842d641a5',
          notation: "R2 U' F' U F R2",
        },
        {
          id: 'a79d99d6-e568-4fbc-b725-2dac6e60cdbd',
          notation: "y U' R U R' U R U R'",
        },
        {
          id: '7e03b08e-ddb2-4c93-afb2-a4b1b7b01576',
          notation: "Dw' R U R' U R U R'",
        },
        {
          id: 'ab0a3667-551c-4f75-a11f-8aa424d3c7c4',
          notation: "U R' U R Dw' R U R'",
        },
      ],
    },
  },
});
