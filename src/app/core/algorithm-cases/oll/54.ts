import { defineOllCase } from './oll-case';

/** OLL 54のケース定義。 */
export const OLL_54_CASE = defineOllCase({
  number: '54',
  names: ['Anti-Frying Pan'],
  group: 'Small L Shape',
  algorithms: [
    { id: '140c8baa-738c-46da-acb5-bf3f6f79659b', notation: "(Rw U2 R' U') R U R' U' R U' Rw'" },
    { id: '2ca314b6-11c7-4987-b070-18b50ef4603f', notation: "(y) Rw U R' U R U' R' U R U2 Rw'" },
  ],
  pattern: [
    ['none', 'yellow', 'none', 'yellow', 'none'],
    ['none', 'none', 'yellow', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'none', 'none', 'none', 'none'],
    ['none', 'yellow', 'yellow', 'yellow', 'none'],
  ],
});
