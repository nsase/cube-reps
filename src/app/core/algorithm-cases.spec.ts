import { describe, expect, it } from 'vitest';
import { OLL_CASES, PLL_CASES } from './algorithm-cases';
import { topLayerPatternAfterAlgorithm } from './cube-state';

const cases = [...OLL_CASES, ...PLL_CASES];

describe('algorithm cases', () => {
  it('includes OLL 01 through 57 in order', () => {
    expect(OLL_CASES.map((item) => item.number)).toEqual(
      Array.from({ length: 57 }, (_, index) => String(index + 1).padStart(2, '0')),
    );
  });

  it('provides algorithms and nine yellow stickers for every OLL case', () => {
    for (const item of OLL_CASES) {
      expect(item.kind).toBe('OLL');
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.algorithms.length).toBeGreaterThan(0);
      const yellowCount = item.pattern.flat().filter((color) => color === 'yellow').length;
      expect(yellowCount).toBe(9);
    }
  });

  it('solves the U face from each OLL pattern with every algorithm', () => {
    for (const item of OLL_CASES) {
      for (const algorithm of item.algorithms) {
        const actual = topLayerPatternAfterAlgorithm(item.pattern, algorithm);
        expect.soft(isSolvedUFace(actual), `OLL ${item.number}: ${algorithm}`).toBe(true);
      }
    }
  });

  it('solves the top layer from each PLL pattern with every algorithm', () => {
    for (const item of PLL_CASES) {
      for (const algorithm of item.algorithms) {
        const actual = topLayerPatternAfterAlgorithm(item.pattern, algorithm);
        expect.soft(isSolvedTopLayer(actual), `PLL ${item.number}: ${algorithm}`).toBe(true);
      }
    }
  });

  it('includes every PLL case once in the configured order and group', () => {
    expect(PLL_CASES.map(({ number, group }) => [number, group])).toEqual([
      ['Aa', 'Corner'],
      ['Ab', 'Corner'],
      ['E', 'Corner'],
      ['F', 'Mixed'],
      ['Ga', 'Mixed'],
      ['Gb', 'Mixed'],
      ['Gc', 'Mixed'],
      ['Gd', 'Mixed'],
      ['H', 'Edge'],
      ['Ja', 'Mixed'],
      ['Jb', 'Mixed'],
      ['Na', 'Mixed'],
      ['Nb', 'Mixed'],
      ['Ra', 'Mixed'],
      ['Rb', 'Mixed'],
      ['T', 'Mixed'],
      ['Ua', 'Edge'],
      ['Ub', 'Edge'],
      ['V', 'Mixed'],
      ['Y', 'Mixed'],
      ['Z', 'Edge'],
    ]);
  });

  it('does not include unsupported grouping symbols in algorithms', () => {
    const notation = cases.flatMap((item) => item.algorithms).join(' ');
    expect(notation).not.toMatch(/[\[\]{}]/);
  });

  it('uses w notation for wide moves', () => {
    const notation = cases.flatMap((item) => item.algorithms).join(' ');
    expect(notation).not.toMatch(/(?:^|[^A-Za-z])[udrlfb](?:2|'|\s)/m);
  });

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

  it('uses only yellow and none for OLL patterns', () => {
    for (const item of OLL_CASES) {
      const colors = new Set(item.pattern.flat());
      expect([...colors].every((color) => color === 'yellow' || color === 'none')).toBe(true);
      expect(colors.has('none')).toBe(true);
    }
  });
});

function isSolvedTopLayer(pattern: import('./cube.models').CubePattern): boolean {
  const topIsYellow = pattern
    .slice(1, 4)
    .every((row) => row.slice(1, 4).every((color) => color === 'yellow'));
  const strips = [
    pattern[0].slice(1, 4),
    pattern.slice(1, 4).map((row) => row[0]),
    pattern.slice(1, 4).map((row) => row[4]),
    pattern[4].slice(1, 4),
  ];
  return topIsYellow && strips.every((strip) => strip.every((color) => color === strip[0]));
}

function isSolvedUFace(pattern: import('./cube.models').CubePattern): boolean {
  return pattern.slice(1, 4).every((row) => row.slice(1, 4).every((color) => color === 'yellow'));
}
