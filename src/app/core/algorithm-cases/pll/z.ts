import { definePllCase } from './pll-case';

export const Z_CASE = definePllCase({
  number: 'Z',
  group: 'Edge',
  pattern: [
    ['none', 'orange', 'blue', 'orange', 'none'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['orange', 'yellow', 'yellow', 'yellow', 'red'],
    ['blue', 'yellow', 'yellow', 'yellow', 'green'],
    ['none', 'red', 'green', 'red', 'none'],
  ],
  algorithms: ["M2 U M2 U M' U2 M2 U2 M' U2", "M' U' M2' U' M2' U' M' U2 M2' U"],
});
