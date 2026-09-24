import { defineF2lCase } from './f2l-case';

export const F2L_41_CASE = defineF2lCase({
  number: '41',
  group: 'Pieces in Slot',
  setup: "F' L' U2 L F R U R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'f604db95-7320-4ef7-bc91-5aa07540a2e4',
          notation: "R U' R' Rw U' Rw' U2 Rw U Rw'",
        },
        {
          id: 'ff78b4ce-24ba-4a4a-88a6-f7228a7b1bb7',
          notation: "R U' R' F' L' U2 L F",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'ad9d9a34-372c-4d3b-a6f4-4c670875c7dc',
          notation: "Lw' U Lw U2 Lw' U' Lw L' U' L",
        },
        {
          id: '2432999e-b3fd-4f11-bf90-b7c3ce7aacb9',
          notation: "F R U2 R' F' L' U' L",
        },
        {
          id: '59356f7c-6f0c-4b00-8e1b-71b5ae437b0a',
          notation: "R' F R U2 R' F' R L' U' L",
        },
        {
          id: '102c9f24-f0e5-4557-9f94-857bd47947bd',
          notation: "L' U L F' L' U' L U F L' U L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '96c52d45-27c2-4d94-8888-ee72eed9355d',
          notation: "Fw' L Fw U' L U L' U L U L'",
        },
        {
          id: '53f078b1-5490-49d7-a96a-83cfb5d887c8',
          notation: "L2 F U F' U' L' U L'",
        },
        {
          id: 'f47f95e8-91ee-429f-9540-51f4182805fd',
          notation: "L F U2 F' L' Fw' L' Fw",
        },
        {
          id: 'b393bff8-d88c-4646-bc7c-828b4f6a10e2',
          notation: "L U' L' Lw U' Lw' U2 Lw U Lw'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '9737056b-6217-49e2-b8f3-b3ff2da658ed',
          notation: "Rw' U Rw U2 Rw' U' Rw R' U' R",
        },
        {
          id: '3673d8f1-d812-4b70-88c5-d3cedf712cb2',
          notation: "R' U R' U' F' U F R2",
        },
        {
          id: '2c4d8064-9d49-4521-8d71-9b6e80d53673',
          notation: "Fw R' Fw' U2 R' U' R U' R' U R",
        },
        {
          id: '7c07c7f5-0819-4700-a289-52cdebb96bef',
          notation: "Fw R' Fw' U2 R' U' R U2 R' U2 R",
        },
      ],
    },
  },
});
