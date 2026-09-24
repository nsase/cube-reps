import { defineF2lCase } from './f2l-case';

export const F2L_04_CASE = defineF2lCase({
  number: '04',
  group: 'Easy Inserts',
  setup: "F' U F",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'b054b565-b5f5-4180-8f34-897a93c06572',
          notation: "F' U' F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'd0423916-f84c-4538-9b7d-b365dc7e7d8a',
          notation: "L' U' L",
        },
        {
          id: '9c6ee3e3-7ab2-4a88-b015-380e61c9906b',
          notation: "U2 R' F R U R' F' R",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'aa1da4ea-4355-44fa-bd08-dd8e19006e09',
          notation: "Fw' L' Fw",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'e688ef5f-5875-42b5-a7fc-f8aabbee8519',
          notation: "R' U' R",
        },
        {
          id: '0728ba79-7d58-439f-b75d-66bf992b0324',
          notation: "U2 Rw' R' F R F' Rw",
        },
      ],
    },
  },
});
