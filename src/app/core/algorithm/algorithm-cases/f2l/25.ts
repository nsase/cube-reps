import { defineF2lCase } from './f2l-case';

export const F2L_25_CASE = defineF2lCase({
  caseId: 'F2L-25',
  number: '25',
  group: 'Corner in Slot',
  setup: "F' R U R' U' R' F R",
  slots: {
    FR: {
      algorithms: [
        {
          id: '4678a7d7-5f44-4ad3-a880-1015c8087bfa',
          notation: "U' R' F R F' R U R'",
        },
        {
          id: '8288eeea-4132-4e72-9478-ce695f7a495a',
          notation: "R' F' R U R U' R' F",
        },
        {
          id: 'dea73611-530b-42ad-af36-0b31047723c5',
          notation: "U' F' U F U R U' R'",
        },
        {
          id: '1a9c6461-5a45-45a0-b81c-a01d4dbce4ba',
          notation: "Lw' U' Lw U Lw F' Lw' F",
        },
        {
          id: '79660918-b7db-4d93-8335-2f405fd479db',
          notation: "U' F' R U R' U' R' F R",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '4f9dd29f-bd0b-4f1f-bdaf-d62d43be8d9b',
          notation: "U' L' U L F' Rw U Rw'",
        },
        {
          id: '0b5ab2b6-cf5e-4763-82c5-986a9a21c535',
          notation: "U' L' U L F' L F L'",
        },
        {
          id: 'c32869fa-8236-4cf3-bdb8-1b2e375b5de8',
          notation: "U' L' U L U F U' F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '16178381-7f37-41f8-8730-d17b7c0f7969',
          notation: "L U' L' U' L U' L' U L U L'",
        },
        {
          id: 'ff4775fb-6959-40cc-8fa9-a56c243eebf9',
          notation: "U' Fw' L' Fw U L U L'",
        },
        {
          id: 'cf36395d-37fd-430a-bfdb-740004c7787d',
          notation: "L' U' L' U' L' U L U L",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'f91cea26-d80a-4620-86c6-bdafcf70ca27',
          notation: "U' R' U M U' R U M'",
        },
        {
          id: '0aa17811-764f-4e5f-a5a5-4145f07377ca',
          notation: "U' R' U R Rw' U' R U M'",
        },
      ],
    },
  },
});
