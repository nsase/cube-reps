import { defineF2lCase } from './f2l-case';

/** F2L 21のFR基準の共通Setupと4スロット分の組み込み手順。 */
// SpeedCube 17
// CubeRoot H+
export const F2L_21_CASE = defineF2lCase({
  number: '21',
  group: 'Connected Pairs',
  setup: "R U' R' U R U2 R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'd60bd4c9-408a-452a-a589-48f4cc457c1f',
          notation: "R U2 R' U' R U R'",
        },
        {
          id: 'ef79c9a6-afbc-4a0d-ad2d-17121646586d',
          notation: "y2 L U2 L' U' L U L'",
        },
        {
          id: '3cf5428f-c1b1-4aff-8a0c-38790ec2654b',
          notation: "R U R' U' R U2 R' U2 R U R'",
        },
        {
          id: '2dc77586-a5a0-46f5-b862-13f69c592613',
          notation: "y L F' L' F L' U L U' L' U L",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '82e435b5-9f2f-4b55-8be9-f67ae2da7e28',
          notation: "L F' L' F L' U L U' L' U L",
        },
        {
          id: 'f2abd3ec-7e1f-480c-a34b-9c6ff90cb07d',
          notation: "y L U2 L' U' L U L'",
        },
        {
          id: 'bb6b9c5a-713f-4be8-a159-53c5093b189b',
          notation: "L' U2 L U2 Lw' U L U' L' U' Lw",
        },
        {
          id: '1cac7f2c-6632-48d4-b697-d29e77f120f6',
          notation: "y' R U2 R' U' R U R'",
        },
        {
          id: 'e19b5cc9-5151-4598-bd8d-fac54909486e',
          notation: "F U2 F' U' F U F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '4dfddf79-1e72-4270-b338-033003c7fd74',
          notation: "L U2 L' U' L U L'",
        },
        {
          id: '331bfc92-20a9-4431-8824-35d4457b437b',
          notation: "L U L' U' L U2 L' U2 L U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '39c02277-570c-495c-96b1-742afc24bbd8',
          notation: "R' U2 F R U R' U' F' R",
        },
        {
          id: 'ee02ba8b-4cb3-43fa-aa5f-fb98738d7a47',
          notation: "y' L U2 L' U' L U L'",
        },
        {
          id: 'd8720aea-b88d-44a3-ae8b-25e41d317642',
          notation: "y R U2 R' U' R U R'",
        },
        {
          id: '3e6f8faf-e464-458b-ae49-6349bb682469',
          notation: "Lw U' R' U Lw' U R U' R' U R",
        },
      ],
    },
  },
});
