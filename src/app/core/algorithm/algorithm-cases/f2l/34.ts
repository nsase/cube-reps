import { defineF2lCase } from './f2l-case';

export const F2L_34_CASE = defineF2lCase({
  caseId: 'F2L-34',
  number: '34',
  group: 'Edge in Slot',
  setup: "R' D' R U R' D R U'",
  slots: {
    FR: {
      algorithms: [
        {
          id: 'fcde042f-29c6-46e1-81ae-3e10247033b8',
          notation: "U R U R' U2 R U R'",
        },
        {
          id: '6192c810-b86a-41a0-86c0-f7ad8a686922',
          notation: "U' R U2 R' U R U R'",
        },
      ],
    },
    FL: {
      algorithms: [
        {
          id: '76c3ab73-9542-4c55-bf92-1ddb04576ee3',
          notation: "U L' U L U2 L' U L",
        },
        {
          id: '6c57f92f-b3a1-44bf-a7e5-5a1576527c9d',
          notation: "U L' U L U L' U2 L",
        },
        {
          id: 'c6bddcf4-6615-4a73-8fa1-1a4257228de5',
          notation: "L' U' L U L' U L U' L' U L",
        },
      ],
    },
    BL: {
      algorithms: [
        {
          id: '69c72218-2507-49b7-a087-b02f213ffe60',
          notation: "U L U L' U2 L U L'",
        },
        {
          id: 'cac14f4d-6943-41e9-a5ce-7f39f31480bf',
          notation: "U' L U2 L' U L U L'",
        },
      ],
    },
    BR: {
      algorithms: [
        {
          id: '04231d5c-58df-4739-9601-0acb3132fb9f',
          notation: "U R' U R U R' U2 R",
        },
        {
          id: '38985ce1-39c8-48a3-8254-3e01cec01c3f',
          notation: "U Fw R2 U R2 U' Fw'",
        },
        {
          id: '8b76ca59-a4b7-44fc-913a-ff429c4fdaf5',
          notation: "U R2 F R F' R U' R' U R",
        },
        {
          id: 'b8b86ab8-61df-4ad2-9ebc-2066f8547036',
          notation: "U R' U R U2 R' U R",
        },
        {
          id: '0ec7df17-51c1-47d7-927b-6a16fa0c66e0',
          notation: "R' U' R U R' U R U' R' U R",
        },
      ],
    },
  },
});
