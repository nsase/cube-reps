import { defineF2lCase } from './f2l-case';

export const F2L_20_CASE = defineF2lCase({
  caseId: 'F2L-20',
  number: '20',
  group: 'Connected Pairs',
  setup: "F' U F U2 R U R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'ee146781-4f75-49c5-babe-9c6e46d99db2',
          notation: "R U' R' U2 F' U' F",
        },
        {
          id: '948809fd-cfdf-448e-9116-d17c5fa2ff10',
          notation: "U M' U R U' Rw' U' R U R'",
        },
        {
          id: 'a3188b2f-2eb2-4ebc-b66c-891708e1b62f',
          notation: "U F U R U' R' F' R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '433797a2-d2ae-4a3a-ad61-e3577512e76f',
          notation: "F U' R U' R' U2 F'",
        },
        {
          id: '3680a5cf-1cb1-4551-93d1-ba09a3fc3ed9',
          notation: "L' U' L U2 L' U L U' L' U L",
        },
        {
          id: '6a578cf7-9cb0-4181-ad8e-92a2263e7d1e',
          notation: "L' U2 L U' L' U' L U' L' U L",
        },
        {
          id: 'c49f1fa0-0852-41a7-b96f-8a91582a9408',
          notation: "M U' Lw' U Lw U M'",
        },
        {
          id: '3c92e632-0b53-40b5-b261-d7065f2047ed',
          notation: "F U' F' U2 L' U' L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'e2d762df-8083-455b-ae8c-0b7329e0112f',
          notation: "L U' L' U2 Fw' L' Fw",
        },
        {
          id: 'bfae9c8a-4f9d-4de7-aa6a-f1058f38d733',
          notation: "L2 F' L' F L' U2 L U' L'",
        },
        {
          id: 'c64e43ef-07d9-409b-b31d-bb51164ac393',
          notation: "U M U L U' Lw' U' L U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '69a8579a-4e06-4012-a145-9486fe76bc2b',
          notation: "R' U' R U2 R' U R U' R' U R",
        },
        {
          id: 'bf65baf4-5c1c-4a7f-add6-56678fc518fd',
          notation: "M' U' Rw' U Rw U M",
        },
        {
          id: '09cf58ab-f66b-411b-918b-aa9994e0abba',
          notation: "F R' F' R U2 R' U' R2 U' R'",
        },
      ],
    },
  },
});
