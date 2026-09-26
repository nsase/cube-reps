import { defineF2lCase } from './f2l-case';

export const F2L_29_CASE = defineF2lCase({
  caseId: 'F2L-29',
  number: '29',
  group: 'Corner in Slot',
  setup: "R U' R' U R U' R'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'e0cdd1a4-2e1e-41fd-8476-0d5faa353718',
          notation: "R U R' U' R U R'",
        },
        {
          id: '6c48390f-e3a0-489c-ae07-702545c50603',
          notation: "U' R U2 R' U2 R U R'",
        },
        {
          id: '1b0906b3-44ba-4173-b30a-00f8eb8265ae',
          notation: "U' F R' F' R2 U R'",
        },
        {
          id: '3137be82-c1c6-4e63-8032-9570c6df5de6',
          notation: "U2 F' U F R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '5b841e8e-5b9a-4521-b534-6ff3585e2d7a',
          notation: "L F' L' F U' L' U L",
        },
        {
          id: 'fd199936-efbb-498a-9c4c-85bbfecffdd7',
          notation: "U' F U' R U2 R' F'",
        },
        {
          id: '1a553443-c416-4557-81b9-13b0b2564fa7',
          notation: "L F' L' F L F' L' F",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: 'ad721ea5-fc02-4f15-8c32-edc4ad50023b',
          notation: "L U L' U' L U L'",
        },
        {
          id: '9c833468-0cb5-4c2e-84d1-2b75fe808f01',
          notation: "U' L U2 L' U2 L U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '1fb086b2-d8be-4b1e-953d-6694657df3eb',
          notation: "Fw R Fw' U' Fw R Fw'",
        },
        {
          id: '938f3eb6-bf27-4522-bc28-abc628ddfce1',
          notation: "U2 R' U R Fw R Fw'",
        },
      ],
    },
  },
});
