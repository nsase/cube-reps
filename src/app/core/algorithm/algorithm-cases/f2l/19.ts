import { defineF2lCase } from './f2l-case';

export const F2L_19_CASE = defineF2lCase({
  number: '19',
  group: 'Connected Pairs',
  setup: "R U' R' U2 F' U' F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'a7eb2dab-6f5d-4534-9489-ef0ca4233dcb',
          notation: "M U Rw U' Rw' U' M'",
        },
        {
          id: '6fa5123c-566d-44c5-8a8b-32b7baad6cba',
          notation: "R U R' U2 R U' R' U R U' R'",
        },
        {
          id: 'f0c68abd-fbd4-47d0-b74a-d122a298b0e6',
          notation: "F' U F U2 R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'fba3e2f8-b7ca-4269-9c5b-d6813e8b68b0',
          notation: "F U2 R U R' U F'",
        },
        {
          id: 'f87597e6-6189-47ef-9a1b-c2f4e06fdd6a',
          notation: "L' U L U2 F U F'",
        },
        {
          id: '2c899c20-cad1-41dd-bf3b-08f31dd9da3e',
          notation: "U L' Lw U' Lw' U Lw U Lw' U L",
        },
        {
          id: '4fd2b7d1-63a8-439c-a7fc-30a4dd20adfb',
          notation: "U' M' U' L' U Lw U L' U' L",
        },
        {
          id: '7ec5258c-3c8d-4d09-b098-c7426104df2c',
          notation: "U' F' U' L' U L F L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '326b0de9-01fb-48f4-b742-b879c6347aa1',
          notation: "L U L' U2 L U' L' U L U' L'",
        },
        {
          id: 'a55e2fe7-abef-420f-bdf9-5df9a6306115',
          notation: "M' U Lw U' Lw' U' M",
        },
        {
          id: '235cb9cd-538e-4446-aaa6-2492ee4d51e2',
          notation: "Fw' L Fw U2 L U L'",
        },
        {
          id: 'd5f45e3b-aaf1-4314-b461-8774c9087480',
          notation: "L U2 L' U L U L' U L U' L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'b502c7a5-9f43-40d4-83dc-ba0bec881181',
          notation: "R' U R U2 Fw R Fw'",
        },
        {
          id: '1c0279ab-4fde-4240-9fb3-5bd92c64d881',
          notation: "R2 F R F' R U R' U2 R",
        },
        {
          id: '6df721d0-7f29-43e3-8baa-ff927507ebd5',
          notation: "R2 F R F' R U2 R' U R",
        },
        {
          id: 'c4ec8d54-91fe-4707-8e1d-9b2939abc8a3',
          notation: "U' M U' R' U Rw U R' U' R",
        },
      ],
    },
  },
});
