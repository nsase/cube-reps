import { defineF2lCase } from './f2l-case';

export const F2L_13_CASE = defineF2lCase({
  number: '13',
  group: 'Disconnected Pairs',
  setup: "R B U2 B' R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '48acc33a-178f-4ff1-95de-a95b8d35c279',
          notation: "U2 R U R' U R U' R'",
        },
        {
          id: 'a56c491d-8bf7-4eff-88e0-a4cfc51bffbb',
          notation: "R U' R' U2 R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '47f6e144-c93f-4d7a-9ecb-149feaae9316',
          notation: "Lw' U Lw U2 Lw' U' Lw",
        },
        {
          id: 'eba5f280-3f02-4d92-9cad-b767a6cf08d9',
          notation: "F R U2 R' F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '4d130cbf-eada-4b6c-ba5f-77c3001176e4',
          notation: "L U' L' U2 L U L'",
        },
        {
          id: 'e03ee758-ca77-4f71-8cc8-e4f6ddd39646',
          notation: "U2 L U L' U L U' L'",
        },
        {
          id: 'd74f958e-9314-4dcf-883c-a9584ef10835',
          notation: "Lw U' L' U2 L U Lw'",
        },
        {
          id: 'a553404a-f9b3-4643-a31b-feb5b6185212',
          notation: "L F U2 F' L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'de30cd18-8138-482a-99dc-587fd3d9947d',
          notation: "Rw' U Rw U2 Rw' U' Rw",
        },
        {
          id: '3c5686b3-452c-4e68-b33e-e825accb334f',
          notation: "U Fw U R U' R Fw'",
        },
      ],
    },
  },
});
