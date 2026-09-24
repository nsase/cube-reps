import { defineF2lCase } from './f2l-case';

export const F2L_30_CASE = defineF2lCase({
  number: '30',
  group: 'Corner in Slot',
  setup: "F R' F' R F R' F' R",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd87f187f-7eb6-42e3-91b4-b1688ffcbaac',
          notation: "R' F R F' U R U' R'",
        },
        {
          id: '6df7e4cb-c9c9-4083-a7ec-69f87f919d53',
          notation: "R' F R F' R' F R F'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '1473558f-d990-496a-91e2-d42c0073f1e2',
          notation: "L' U' L U L' U' L",
        },
        {
          id: '87b8bf71-f90b-478a-a481-c69ffe79d899',
          notation: "U L' U2 L U2 L' U' L",
        },
        {
          id: 'ec646e15-88dc-40dd-bbc9-411c352251d3',
          notation: "U F' L F L2 U' L",
        },
        {
          id: 'd69a291f-f9f2-466a-9ae0-2a83baa99922',
          notation: "F' L F L' F' L F L'",
        },
        {
          id: 'ff350fa0-211b-4bad-8126-3ca5096978ab',
          notation: "U2 F U' F' L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '92d1ebf0-e95a-4e14-aadd-d287b95f3c93',
          notation: "U2 L U' L' Fw' L' Fw",
        },
        {
          id: 'b61872c7-97d5-4e49-98af-62a8fd5dc49f',
          notation: "Fw' L' Fw U Fw' L' Fw",
        },
        {
          id: '251e9021-3a36-4b02-9c01-17a430d6e406',
          notation: "x' U' F' U F U' F' U x",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '8bac9043-71f1-4ecd-a9eb-6a4b514f7714',
          notation: "R' U' R U R' U' R",
        },
        {
          id: '5ec572fd-b49f-4056-8a48-9b6ecc4f92c0',
          notation: "U R' U2 R U2 R' U' R",
        },
        {
          id: 'b5ad4f81-0c6b-445e-afff-338f9cdd03b0',
          notation: "U Fw' U Fw R2 U' R",
        },
      ],
    },
  },
});
