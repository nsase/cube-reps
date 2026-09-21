import { defineF2lCase } from './f2l-case';

/** F2L 31のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 31
// CubeRoot T
export const F2L_31_CASE = defineF2lCase({
  number: '31',
  group: 'Edge in Slot',
  setup: "R U2 R' F' U' F",
  slots: {
    FR: {
      algorithms: [
        {
          id: '10c1912d-1193-4bda-89fb-fcf80afdc600',
          notation: "U' R' F R F' R U' R'",
        },
        {
          id: '376b01e3-6fd4-45a0-bf18-882066af5295',
          notation: "R U' R' U y' R' U R",
        },
        {
          id: 'f2cb33a1-29d2-4de0-b0df-b72265831d3d',
          notation: "F' U F R U2 R'",
        },
        {
          id: '8ca3e09e-1cbc-4055-882a-ecb373ca0e4b',
          notation: "R U' R' U y L' U L",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'fcd1827d-f778-417d-a780-ab089aa2e06b',
          notation: "U L F' L' F L' U L",
        },
        {
          id: '90433aa5-57f0-4265-9c5d-5033a91ad142',
          notation: "L' U L U' y L U' L'",
        },
        {
          id: '395772bd-5b39-43e2-8449-e9ec77662d94',
          notation: "L' U L F U2 F'",
        },
        {
          id: 'eb474faa-0e6d-408b-8a9a-a7fbd91b7195',
          notation: "U' F' L F L' F U' F'",
        },
        {
          id: '99c50661-344c-4ee7-a9f3-ac889f3920d8',
          notation: "F U' F' L' U2 L",
        },
        {
          id: 'bb67f42f-f979-4925-a19e-59e7b9fbe4a7',
          notation: "L' U L U' y' R U' R'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '72801fc9-6144-402e-9b07-f1865757faa8',
          notation: "L U' L F' L' F L'",
        },
        {
          id: 'ab6b007c-1217-4732-8224-98a8a1890158',
          notation: "Fw' L Fw U' L U' L'",
        },
        {
          id: 'b29e9f30-9127-46b1-ace8-0f2063c92d43',
          notation: "B' U B L U2 L'",
        },
        {
          id: 'e094a7c0-383a-40ef-a2a6-64887edae045',
          notation: "L U2 L' U' Lw U L' U' M'",
        },
        {
          id: 'd9ae5824-0831-4833-a958-c20b6162845b',
          notation: "L U' L' U y' L' U L",
        },
        {
          id: 'eb116318-100d-4adb-8072-2d1836335706',
          notation: "L U' L' U y R' U R",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'f2cf7bb6-59f9-4b0b-866a-7ca124b6f7bd',
          notation: "R' U R' F R F' R",
        },
        {
          id: '7d8b917f-7c2b-4fd1-9340-f7f0f9d40472',
          notation: "R' U R Fw R2 Fw'",
        },
        {
          id: '228e257f-74a7-436a-97c8-877c7e7edc13',
          notation: "R' U R y R U2 R'",
        },
        {
          id: '4fd2ec46-637e-4559-9695-09dc6aaa8ef6',
          notation: "Fw R' Fw' U R' U R",
        },
        {
          id: '472109e9-5735-44ab-a3f1-cd9cd28ef53a',
          notation: "R' U R U' y R U' R'",
        },
        {
          id: '54f6ec44-911f-464a-8782-95e4bc2238ed',
          notation: "R' U R U' y' L U' L'",
        },
      ],
    },
  },
});
