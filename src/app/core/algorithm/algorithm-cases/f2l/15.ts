import { defineF2lCase } from './f2l-case';

export const F2L_15_CASE = defineF2lCase({
  number: '15',
  group: 'Connected Pairs',
  setup: "R U' R' U F' U2 F U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'c99dbc6b-19d2-4428-8db3-50d2a2a8214d',
          notation: "R U' R' U R U' R' U2 R U' R'",
        },
        {
          id: '12cb5148-2b10-49e0-a9b1-08804cd08bf0',
          notation: "R' U2 R2 U R2 U R",
        },
        {
          id: 'fa19e237-4142-4833-a4b3-f4faad2901ed',
          notation: "U F' U2 F U' R U R'",
        },
        {
          id: '99995dc3-5da3-43ba-8230-8a524a3b8184',
          notation: "U R U' R' U' R U R' U' R U R'",
        },
        {
          id: '935cd642-943a-49bb-9c18-e8a0e6ea2aa3',
          notation: "R U' R' U R U' R' U' R U2 R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '2df26a68-8da0-483e-a540-6d29109ca8ce',
          notation: "U L' U2 L U' F U F'",
        },
        {
          id: '1b38ff58-f704-47bc-b1f7-81a090b90f84',
          notation: "L' U2 L U Lw' U Lw U2 Lw' U' Lw",
        },
        {
          id: '9a3284f0-ff4b-41c0-9b1a-7f4167645ca9',
          notation: "F U' R U2 R' U2 F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '4310b2dd-35aa-42fc-9f9f-73d0361fceeb',
          notation: "L' U2 L2 U L2 U L",
        },
        {
          id: '13caf399-8ab7-4761-8b7f-8827ad92c924',
          notation: "U2 R' U2 R U2 L U L' U2 R' U R",
        },
        {
          id: '3982f0b8-79ee-4eca-bb24-65f8b7d640c4',
          notation: "L U' L' U L U' L' U2 L U' L'",
        },
        {
          id: '6543f8a5-5dcb-438f-8e34-c3843945d204',
          notation: "U L U' L' U' L U L' U' L U L'",
        },
        {
          id: 'f5a464f9-d41b-457b-94d2-90131055b566',
          notation: "L U' L' U L U' L' U' L U2 L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '3e2d163a-a5ef-43c9-9a47-8cab01f1414c',
          notation: "U R' U2 R U' Fw R Fw'",
        },
        {
          id: '98ab056d-2c50-46dc-9a8e-0870575f4cb1',
          notation: "Fw R' U R2 U' R2 Fw'",
        },
        {
          id: 'a9f5f5ce-6b12-411f-a389-59c74afe30e4',
          notation: "U R' U2 R M U2 R' U R U M'",
        },
      ],
    },
  },
});
