import { defineOllCase } from './oll-case';

/** OLL 07のケース定義。 */
export const OLL_07_CASE = defineOllCase({
  number: '07',
  names: ['Lightning', 'Wide Sune'],
  group: 'Small Lightning Bolt',
  algorithms: [{ id: '2867d2d6-4154-481f-af14-66e10c8d796c', notation: "Rw U R' U R U2 Rw'" }],
  pattern: [
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'yellow', 'none', 'yellow'],
    ['none', 'yellow', 'none', 'none', 'none'],
    ['none', 'none', 'yellow', 'yellow', 'none'],
  ],
});
