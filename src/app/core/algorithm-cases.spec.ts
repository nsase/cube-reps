import { describe, expect, it } from 'vitest';
import { OLL_CASES, PLL_CASES } from './algorithm-cases';

const cases = [...OLL_CASES, ...PLL_CASES];

describe('algorithm case patterns', () => {
  it('uses a 5x5 matrix for every OLL and PLL case', () => {
    expect(cases).toHaveLength(78);
    for (const item of cases) {
      expect(item.pattern).toHaveLength(5);
      item.pattern.forEach((row) => expect(row).toHaveLength(5));
    }
  });

  it('leaves the four outer corners empty', () => {
    for (const item of cases) {
      expect(item.pattern[0][0]).toBe('none');
      expect(item.pattern[0][4]).toBe('none');
      expect(item.pattern[4][0]).toBe('none');
      expect(item.pattern[4][4]).toBe('none');
    }
  });

  it('uses only two sticker colors for OLL patterns', () => {
    for (const item of OLL_CASES) {
      const colors = new Set(item.pattern.flat().filter((color) => color !== 'none'));
      expect([...colors].every((color) => color === 'yellow' || color === 'white')).toBe(true);
    }
  });
});
