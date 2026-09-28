import { defineF2lCase } from './f2l-case';

export const F2L_03_CASE = defineF2lCase({
  caseId: 'F2L-03',
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
      ],
    },
    FL: {
      algorithms: [
        {
          id: 'c082c1c1-7af3-45ac-a8de-1dbd740a7e9d',
          notation: "F U F'",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '742d26ac-994e-4ccb-839d-496398cd5c66',
          notation: "L U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: 'db87c734-0582-45f3-a025-d93d361f4c16',
          notation: "Fw R Fw'",
        },
      ],
    },
  },
});
