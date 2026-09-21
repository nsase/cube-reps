import { defineF2lCase } from './f2l-case';

/** F2L 13のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 21
// CubeRoot P+
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
        {
          id: '44116dec-1e32-4efb-b1cc-87d6c1cd953e',
          notation: "R B U2 B' R'",
        },
        {
          id: '72f6b8e1-c5af-4c92-8bd6-9e08f884f4c0',
          notation: "y' Fw R' Fw' U2 Fw R Fw'",
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
        {
          id: '0a9ac1fd-bbfb-4e0e-91a7-832dcd9124b8',
          notation: "y U2 L U L' U L U' L'",
        },
        {
          id: '14bb0538-c1f5-41c6-be61-3d5b6defe5ec',
          notation: "y L U' L' U2 L U L'",
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
          id: 'ce442854-f6fb-40aa-8838-a2575131e36b',
          notation: "y' U2 L U L' U L U' L'",
        },
        {
          id: '0c095179-1d55-49c1-9ce7-93a905b8bb9d',
          notation: "U2 R' U' R S R Fw' U' F",
        },
        {
          id: '3c5686b3-452c-4e68-b33e-e825accb334f',
          notation: "U Fw U R U' R Fw'",
        },
      ],
    },
  },
});
