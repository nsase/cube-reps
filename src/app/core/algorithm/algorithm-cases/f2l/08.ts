import { defineF2lCase } from './f2l-case';

/** F2L 08のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 8
// CubeRoot M-
export const F2L_08_CASE = defineF2lCase({
  number: '08',
  group: 'Disconnected Pairs',
  setup: "F' U2 F U' F' U2 F U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd56308c4-1d24-4790-a7d6-ed87e27e4fb7',
          notation: "Rw' U2 R2 U R2 U Rw",
        },
        {
          id: 'ab4ff3c1-d2a3-4bfd-9e4b-f7ee01533a39',
          notation: "Dw R' U2 R U R' U2 R",
        },
        {
          id: '9239c2e8-d232-4d10-be62-c5260c015fb1',
          notation: "y' U R' U2 R U2 R' U R",
        },
        {
          id: '00faa1d5-1b6f-4c51-be4a-2fc5ec46849a',
          notation: "y U L' U2 L U2 L' U L",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'b57776c4-8ca9-449f-a793-21f27f28ed44',
          notation: "U L' U2 L U L' U2 L",
        },
        {
          id: 'bb32e276-3252-452d-bd6e-47d8d99bb4a0',
          notation: "U Rw' F2 Rw U2 Rw' F Rw",
        },
        {
          id: 'ce251322-634b-4da8-97bc-4845294f7a40',
          notation: "U' R' U2 R U R' U R U2 L' U L",
        },
        {
          id: '9fec3ed9-6b74-4f4f-9109-21474abe87c9',
          notation: "U L' U2 L U' L F' L' F",
        },
        {
          id: '040caa53-8d30-4297-82b0-1d42b2cedc38',
          notation: "U L' U2 L U2 L' U L",
        },
        {
          id: '6dda975a-084e-415c-b7be-4353df4d51cd',
          notation: "M' U M U2 Lw' U Lw",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'b8c85ede-ca9f-4893-b7eb-ae188ad08df8',
          notation: "Lw' U2 L2 U L2 U Lw",
        },
        {
          id: '11081ce0-3b65-479f-821e-d69bfde98bc6',
          notation: "y U R' U2 R U R' U2 R",
        },
        {
          id: 'd3c1447d-f532-4d73-9567-8d3418a774fe',
          notation: "Dw L' U2 L U2 L' U L",
        },
        {
          id: 'befa5803-db66-4cc7-a456-e6a7d5be442d',
          notation: "Fw' L' U' L2 U L' Fw",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '75583edc-b094-48b4-96a8-957e2d1dcedd',
          notation: "U R' U2 R U R' U2 R",
        },
        {
          id: '50f9adf3-dea4-4131-ae7d-65fb021014ed',
          notation: "U R' U2 R U2 R' U R",
        },
        {
          id: 'f337bfd0-0585-412c-b2c3-5fbdc1d12d93',
          notation: "M U M' U2 Rw' U Rw",
        },
      ],
    },
  },
});
