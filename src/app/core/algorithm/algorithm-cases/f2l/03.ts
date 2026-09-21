import { defineF2lCase } from './f2l-case';

/** F2L 03のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 4
// CubeRoot B+
export const F2L_03_CASE = defineF2lCase({
  number: '03',
  group: 'Easy Inserts',
  setup: "R U' R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '849d49f6-4441-4ef5-9fc6-06e28fbea9d4',
          notation: "R U R'",
        },
        {
          id: '5cd19d65-183c-4b24-b025-7420857a517d',
          notation: "y' Fw R Fw'",
        },
        {
          id: 'faaf4ba5-e3e7-4b5a-89b9-776e427b3c53',
          notation: "y F U F'",
        },
        {
          id: '334a4a07-249b-4e20-8c97-577b45e1ac1d',
          notation: "y2 L U L'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'c082c1c1-7af3-45ac-a8de-1dbd740a7e9d',
          notation: "F U F'",
        },
        {
          id: 'a387b963-465b-4214-be4b-440420f3b1e9',
          notation: "y L U L'",
        },
        {
          id: 'e88e7f1c-5365-4e0c-ba00-bb549dfdec55',
          notation: "S' L F' L' Fw",
        },
        {
          id: 'bc845419-655b-43c0-ad4b-d649ec028356',
          notation: "U' M L' U L U' M'",
        },
        {
          id: 'c06adf5c-c210-4763-b7fe-22f955cd2854',
          notation: "S' U' L' U L S",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '742d26ac-994e-4ccb-839d-496398cd5c66',
          notation: "L U L'",
        },
        {
          id: '19fa4b8a-c56f-4372-bcc4-c9a47985d7f1',
          notation: "Rw B Rw'",
        },
        {
          id: '2b6b27a7-ff03-4241-9f41-0176ac6a111e',
          notation: "U Fw R U R' U2 Fw' Rw x'",
        },
        {
          id: '1794d9b7-cef4-4e95-8d41-9d7894788fa0',
          notation: "y2 R U R'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'db87c734-0582-45f3-a025-d93d361f4c16',
          notation: "Fw R Fw'",
        },
        {
          id: '2ad1e4b9-36d9-497c-b1a6-200530e8f599',
          notation: "y' L U L'",
        },
        {
          id: 'c1fc7eae-3250-4d0b-b3c5-7cecb5263e00',
          notation: "y R U R'",
        },
        {
          id: '9d98638f-b993-4854-aa3d-dcc32967c474',
          notation: "U' Rw R2 U R U' M",
        },
        {
          id: 'cf639772-fa8c-43ea-9e65-517b8970cae8',
          notation: "S U' R' U R S'",
        },
      ],
    },
  },
});
