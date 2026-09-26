import { defineF2lCase } from './f2l-case';

export const F2L_27_CASE = defineF2lCase({
  caseId: 'F2L-27',
  number: '27',
  group: 'Corner in Slot',
  setup: "R U R' U' R U R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '9025b5f7-a082-47e7-93b7-d80312ef57e9',
          notation: "R U' R' U R U' R'",
        },
        {
          id: '2270190d-3f15-4f2c-a8ff-e997c07bee91',
          notation: "F' U' F U2 R U' R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '098125d9-bc8a-4611-a56f-303a0400c319',
          notation: "L' U' L U F' Rw U Rw'",
        },
        {
          id: '94568ceb-f87c-4bae-a6fb-21b35d93f040',
          notation: "L' U' L U F' L F L'",
        },
        {
          id: 'be5a439a-2a49-493c-8954-639e13b862d3',
          notation: "U' F R U2 R' U F'",
        },
        {
          id: '9e33e6e5-4e19-460c-9b35-378c1d1eed59',
          notation: "F U' F' U F U' F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '1f756431-bc04-482c-80b5-51c22130b6a1',
          notation: "L U' L' U L U' L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '60817b3c-fc0a-49ad-9ae6-52e06774798d',
          notation: "R' U2 R' F R F' R",
        },
        {
          id: 'a195db8e-d099-4277-b974-3df00d90f8c6',
          notation: "R' U' R U Rw' U' R U M'",
        },
        {
          id: '041fcb2c-fa03-4aa4-81fc-8f5aa9544be2',
          notation: "R' U' R U Fw' U Fw R'",
        },
        {
          id: '23be437a-f631-453a-a527-b1b6e36c9737',
          notation: "Fw R' Fw' U Fw R' Fw'",
        },
        {
          id: 'b54fb953-09e9-4ba5-bd4c-fbebc570c913',
          notation: "Fw R' Fw' Rw' U' R U M'",
        },
      ],
    },
  },
});
