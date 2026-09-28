import { defineF2lCase } from './f2l-case';

export const F2L_05_CASE = defineF2lCase({
  caseId: 'F2L-05',
  number: '05',
  group: 'Disconnected Pairs',
  setup: "F2 U' L' U L F2",
  slots: {
    FR: {
      algorithms: [
        {
          id: '1df52fd1-c5c8-4479-88bd-07b7bc0ce63a',
          notation: "U' R U R' U2 R U' R'",
        },
        {
          id: '5dae29fd-7ca4-436f-b500-3ee92bf49c09',
          notation: "F2 L' U' L U F2",
        },
        {
          id: '0fde6ac2-33d4-4eef-ab8f-f6d7c8fb8527',
          notation: "U' R U R' U' R U2 R'",
        },
        {
          id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
          notation: "U' R U R' U R' F R F'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '50054c2c-1c99-44eb-b9e2-99f0d041b6fb',
          notation: "U R' F Rw U' Rw' F' R",
        },
        {
          id: '1dd9d704-6585-4043-82a7-840d367da0ac',
          notation: "U2 F R U R' U2 F'",
        },
        {
          id: '55edf133-a7ec-4092-9ac9-a89c9bb5eca4',
          notation: "U Lw' U L U' L' U' Lw",
        },
        {
          id: '7241f2fd-fa00-46dd-ab83-bce2302685ba',
          notation: "U' F U F' U2 F U' F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '82d83693-2923-455a-b02c-2c5f03f976d8',
          notation: "U' L U L' U2 L U' L'",
        },
        {
          id: '4c9557ff-5a90-4a2d-b848-b461fa57c0b0',
          notation: "U' L U L' U' L U2 L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'b9817d24-55c3-438c-b4c6-b68fdf003493',
          notation: "U' R' F R U R' U' F' R",
        },
        {
          id: 'd0769619-e1a2-452c-9591-635412ab460b',
          notation: "R2 F' U' F U R2",
        },
        {
          id: '74870172-e92e-47a5-a7fb-28716071cc9c',
          notation: "U Rw' U R U' R' U' Rw",
        },
      ],
    },
  },
});
