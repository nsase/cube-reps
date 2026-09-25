import { defineF2lCase } from './f2l-case';

export const F2L_35_CASE = defineF2lCase({
  caseId: 'F2L-35',
  number: '35',
  group: 'Edge in Slot',
  setup: "F' U F U' R U' R' U",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'ec970120-eb18-4164-97fd-764c9dab8a28',
          notation: "U' R U R' U F' U' F",
        },
        {
          id: '1f3604c4-0e36-4817-afd8-860960102ca5',
          notation: "U2 R U R' F R' F' R",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'ed8035fe-9082-43ae-ad24-b7d768b50921',
          notation: "U2 F U F' U' L' U L",
        },
        {
          id: '2f4242ba-0083-4542-bc4d-bc7403229ae0',
          notation: "U2 L F' L' F U2 L' U' L",
        },
        {
          id: '165bd5e6-aaba-4950-9654-09c5d3d981d8',
          notation: "U' F R' F R F' U F'",
        },
        {
          id: 'bdd98da7-98eb-4df6-adab-1359feba21d5',
          notation: "U' F U F' U L' U' L",
        },
        {
          id: '499c06cc-cfd4-45ed-a762-0d4a4c60e2fc',
          notation: "L2 Uw' L' U' L U Uw L U' L",
        },
        {
          id: '4e3e9de1-a8c0-4b8c-9b06-ccaf66b9efcf',
          notation: "L' U' L U' L' U' L U F U F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '0486758e-3459-4ef9-b784-36a5ab33672d',
          notation: "U' L U L' U Fw' L' Fw",
        },
        {
          id: 'f6a03a37-25f8-4a50-9f4b-020fa41816cc',
          notation: "U2 L U L' U' L F U F' L'",
        },
        {
          id: '6aec6bb8-1676-421e-8e5c-ad6efc14ef6c',
          notation: "U2 L U M U L' U' M'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'f145b428-d7f2-4855-9254-d9cf5319f904',
          notation: "U' Fw R Fw' U R' U' R",
        },
        {
          id: 'b0b40768-d472-4b30-b18f-654079565c96',
          notation: "R' F R' F' R U R U' R' U' R",
        },
        {
          id: '6ad0c64d-b3ef-4337-8af0-0d3274e09b2f',
          notation: "U2 Fw R Fw' U' R' U R",
        },
        {
          id: 'ccfebef2-21ef-45de-a756-f2b6eb03f0f8',
          notation: "U' R' F' U F U' R U R' U' R",
        },
        {
          id: 'd6a7ef87-34a8-4ccc-8278-f4eca353000f',
          notation: "R2 Uw' R' U' R U Uw R U' R",
        },
      ],
    },
  },
});
