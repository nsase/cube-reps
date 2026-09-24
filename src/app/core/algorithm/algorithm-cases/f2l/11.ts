import { defineF2lCase } from './f2l-case';

export const F2L_11_CASE = defineF2lCase({
  number: '11',
  group: 'Disconnected Pairs',
  setup: "F R' F' R2 U2 R' U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'dc331824-9ce2-4ea2-b961-ebb3efa90502',
          notation: "U R U2 R' U R U' R'",
        },
        {
          id: '4c958250-0a04-45cc-9546-345e4f7f39ce',
          notation: "U R U2 R2 F R F'",
        },
        {
          id: 'ec18e8c9-93cf-4429-b025-8843b27e86c0',
          notation: "R U' R' U R U' R' U R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '24e2b348-c29b-4ddc-8e49-e534f96d1f90',
          notation: "U L' U L2 F' L' F L' U L",
        },
        {
          id: '466e9fcc-a960-42ea-ad05-2d9aab60e7ca',
          notation: "U F U2 F' U F U' F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'b80b4464-3224-4115-a44e-440e8d954625',
          notation: "U L U2 L' U L U' L'",
        },
        {
          id: '4e11f8c1-4b55-46ac-b429-dbdad0fc4ce0',
          notation: "L U' L' U L U' L' U L U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'ea471339-d495-4abb-b1b9-dfe697f31b08',
          notation: "U R' F' U2 F R U R' U' R",
        },
        {
          id: '781e2b13-ea39-48de-ad24-5b837980b7ce',
          notation: "U2 Fw R2 U R2 U' R Fw'",
        },
      ],
    },
  },
});
