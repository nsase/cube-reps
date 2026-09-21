import { defineF2lCase } from './f2l-case';

/** F2L 36のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 36
// CubeRoot V-
export const F2L_36_CASE = defineF2lCase({
  number: '36',
  group: 'Edge in Slot',
  setup: "R U' R' U F' U F U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: '5a2e7c4c-a84d-4a39-b624-406b5b888c20',
          notation: "U F' U' F U' R U R'",
        },
        {
          id: '2e940545-1999-43ec-b137-9d9ae17154ec',
          notation: "U2 R' F R F' U2 R U R'",
        },
        {
          id: '9aa22c15-6ef3-451c-9a88-4b9ad9da57de',
          notation: "R U R' U R U R' U' F' U' F",
        },
        {
          id: 'af5ed1cb-75d8-42a6-84db-0cc5b064e287',
          notation: "R2 Uw R U R' U' Uw' R' U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '339fb87c-2f80-442b-b053-d41a560cb1ba',
          notation: "U L' U' L Dw' L U L'",
        },
        {
          id: '61e6e661-8e6b-44a6-8d75-89d931ddada5',
          notation: "U L' U' L U' F U F'",
        },
        {
          id: 'b418f220-3840-45be-8900-c8a9ade77aa5',
          notation: "U2 L' U L U F U F'",
        },
        {
          id: '2ad5812c-0a38-4a32-989e-779c15e8ec8b',
          notation: "U2 L' U' L F' Rw U Rw'",
        },
        {
          id: 'b10da96c-e116-49e2-aa2f-7b98ad21ee0b',
          notation: "U2 L' U' L F' L F L'",
        },
        {
          id: 'b7e4cf30-26c6-4976-9895-4d502b85998b',
          notation: "U2 L' U' L y U L U' L'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '41057f36-4cca-4508-8003-b75e71efda58',
          notation: "U Fw' L' Fw U' L U L'",
        },
        {
          id: '7347a98c-98cd-4660-9493-946fdf00948f',
          notation: "U2 Fw' L' Fw U L U' L'",
        },
        {
          id: '5e43d47d-1229-416e-8931-6d686cf63827',
          notation: "L F' L F L' U' L' U L U L'",
        },
        {
          id: '585bb3ec-5e65-41fe-b3f7-766244e04804',
          notation: "y U R' U' R U' Fw R Fw'",
        },
        {
          id: 'c3540333-319b-4d42-8bcf-2afbf6d8deaa',
          notation: "L2 Uw L U L' U' Uw' L' U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '3bf0671a-f116-498d-8c0f-fcb51d5f5e09',
          notation: "U R' U' R U' Fw R Fw'",
        },
        {
          id: '6a6bf728-c805-4fc2-8d59-1c41cfe4aeaf',
          notation: "U2 R' U' R U R' F' U' F R",
        },
        {
          id: '700786bd-4495-4867-a9ab-6706ba26383d',
          notation: "U R' U' R y U' R U R'",
        },
        {
          id: 'f0d68af8-f78a-455e-8842-77f372084c6b',
          notation: "U R' U' R U' y R U R'",
        },
        {
          id: '884f4d57-a49c-43e9-9c51-5cce332708d0',
          notation: "U R' U' R Dw' R U R'",
        },
        {
          id: '7257b709-e5ff-445b-86df-da614689a444',
          notation: "U2 R' U' R y U R U' R'",
        },
      ],
    },
  },
});
