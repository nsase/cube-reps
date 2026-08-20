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
      expect(item.name).toBe(item.aliases?.[0]);
      expect(item.aliases?.length).toBeGreaterThan(0);
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

  it('uses the configured OLL 31 algorithm without a U2 setup move', () => {
    expect(OLL_CASES.find((item) => item.number === '31')?.algorithms).toEqual([
      "R' U' F U R U' R' F' R",
    ]);
  });

  it('uses the configured J Perm algorithms for representative OLL cases', () => {
    const oll01 = OLL_CASES.find((item) => item.number === '01');
    expect(oll01?.aliases).toEqual(['Runway', 'Blank']);
    expect(oll01?.algorithms[0]).toBe("R U2 R2 F R F' U2 R' F R F'");
    expect(oll01?.algorithms).toContain("(U) R U' R2 D' Rw U' Rw' D R2 U R'");
    expect(OLL_CASES.find((item) => item.number === '27')?.algorithms[0]).toBe("R U R' U R U2 R'");
    expect(OLL_CASES.find((item) => item.number === '57')?.algorithms[0]).toBe(
      "R U R' U' M' U R U' Rw'",
    );
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

  it('uses the configured Ua and Ub algorithms first', () => {
    expect(PLL_CASES.find((item) => item.number === 'Ua')?.algorithms[0]).toBe(
      "R U' R U R U R U' R' U' R2",
    );
    expect(PLL_CASES.find((item) => item.number === 'Ub')?.algorithms[0]).toBe(
      "R2 U R U R' U' R' U' R' U R'",
    );
    expect(PLL_CASES.find((item) => item.number === 'H')?.algorithms).toEqual([
      'M2 U M2 U2 M2 U M2',
      "M2 U' M2 U2 M2 U' M2",
    ]);
    expect(PLL_CASES.find((item) => item.number === 'T')?.algorithms).toEqual([
      "R U R' U' R' F R2 U' R' U' R U R' F'",
    ]);
  });

  it('does not include grouping symbols in algorithms except setup moves', () => {
    const notation = cases.flatMap((item) => item.algorithms).join(' ');
    expect(notation).not.toMatch(/[\[\]{}]/);
    expect(PLL_CASES.find((item) => item.number === 'Aa')?.algorithms[0]).toBe(
      "x R' U R' D2 R U' R' D2 R2 x'",
    );
    expect(PLL_CASES.find((item) => item.number === 'Aa')?.algorithms[1]).toBe(
      "(y) x' R2 D2 R' U' R D2 R' U R' x",
    );
    expect(PLL_CASES.find((item) => item.number === 'Ab')?.algorithms[1]).toBe(
      "(y') x R2 D2 R U R' D2 R U' R x'",
    );
    expect(PLL_CASES.find((item) => item.number === 'F')?.algorithms[1]).toBe(
      "(y) R' U2 R' Dw' R' F' R2 U' R' U R' F R U' F",
    );
    expect(PLL_CASES.find((item) => item.number === 'Ja')?.algorithms[1]).toBe(
      "(y) x R2 F R F' R U2 Rw' U Rw U2 x'",
    );
    expect(PLL_CASES.find((item) => item.number === 'Na')?.algorithms[1]).toBe(
      "L U' R U2 L' U R' L U' R U2 L' U R'",
    );
    expect(PLL_CASES.find((item) => item.number === 'Ra')?.algorithms[1]).toBe(
      "(y) R U' R' U' R U R D R' U' R D' R' U2 R'",
    );
    expect(PLL_CASES.find((item) => item.number === 'Rb')?.algorithms[1]).toBe(
      "(y) R2 F R U R U' R' F' R U2 R' U2 R",
    );
    expect(PLL_CASES.find((item) => item.number === 'V')?.algorithms[1]).toBe(
      "R' U R' Dw' R' F' R2 U' R' U R' F R F",
    );
    expect(PLL_CASES.find((item) => item.number === 'Z')?.algorithms[1]).toBe(
      "M' U' M2' U' M2' U' M' U2 M2' U",
    );
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

  it('uses the configured side colors for Aa', () => {
    expect(PLL_CASES.find((item) => item.number === 'Aa')?.pattern).toEqual([
      ['none', 'green', 'orange', 'green', 'none'],
      ['orange', 'yellow', 'yellow', 'yellow', 'red'],
      ['blue', 'yellow', 'yellow', 'yellow', 'green'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'red', 'red', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Ab', () => {
    expect(PLL_CASES.find((item) => item.number === 'Ab')?.pattern).toEqual([
      ['none', 'orange', 'orange', 'red', 'none'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['blue', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'red', 'green', 'none'],
    ]);
  });

  it('uses the configured side colors for E', () => {
    expect(PLL_CASES.find((item) => item.number === 'E')?.pattern).toEqual([
      ['none', 'red', 'blue', 'orange', 'none'],
      ['green', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'red', 'green', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for F', () => {
    expect(PLL_CASES.find((item) => item.number === 'F')?.pattern).toEqual([
      ['none', 'blue', 'green', 'orange', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['red', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'green', 'blue', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Ga', () => {
    expect(PLL_CASES.find((item) => item.number === 'Ga')?.pattern).toEqual([
      ['none', 'green', 'blue', 'red', 'none'],
      ['orange', 'yellow', 'yellow', 'yellow', 'blue'],
      ['green', 'yellow', 'yellow', 'yellow', 'orange'],
      ['orange', 'yellow', 'yellow', 'yellow', 'green'],
      ['none', 'blue', 'red', 'red', 'none'],
    ]);
  });

  it('uses the configured side colors for Gb', () => {
    expect(PLL_CASES.find((item) => item.number === 'Gb')?.pattern).toEqual([
      ['none', 'blue', 'red', 'orange', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['orange', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'green', 'blue', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Gc', () => {
    expect(PLL_CASES.find((item) => item.number === 'Gc')?.pattern).toEqual([
      ['none', 'blue', 'orange', 'orange', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['green', 'yellow', 'yellow', 'yellow', 'red'],
      ['red', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'green', 'blue', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Gd', () => {
    expect(PLL_CASES.find((item) => item.number === 'Gd')?.pattern).toEqual([
      ['none', 'green', 'blue', 'red', 'none'],
      ['orange', 'yellow', 'yellow', 'yellow', 'blue'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['orange', 'yellow', 'yellow', 'yellow', 'green'],
      ['none', 'blue', 'orange', 'red', 'none'],
    ]);
  });

  it('uses the configured side colors for H', () => {
    expect(PLL_CASES.find((item) => item.number === 'H')?.pattern).toEqual([
      ['none', 'blue', 'green', 'blue', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['orange', 'yellow', 'yellow', 'yellow', 'red'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'blue', 'green', 'none'],
    ]);
  });

  it('uses the configured side colors for Ja', () => {
    expect(PLL_CASES.find((item) => item.number === 'Ja')?.pattern).toEqual([
      ['none', 'blue', 'green', 'green', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'red'],
      ['red', 'yellow', 'yellow', 'yellow', 'blue'],
      ['green', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'orange', 'orange', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Jb', () => {
    expect(PLL_CASES.find((item) => item.number === 'Jb')?.pattern).toEqual([
      ['none', 'blue', 'blue', 'orange', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'green', 'orange', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Na', () => {
    expect(PLL_CASES.find((item) => item.number === 'Na')?.pattern).toEqual([
      ['none', 'orange', 'orange', 'red', 'none'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['green', 'yellow', 'yellow', 'yellow', 'blue'],
      ['green', 'yellow', 'yellow', 'yellow', 'green'],
      ['none', 'orange', 'red', 'red', 'none'],
    ]);
  });

  it('uses the configured side colors for Nb', () => {
    expect(PLL_CASES.find((item) => item.number === 'Nb')?.pattern).toEqual([
      ['none', 'orange', 'red', 'red', 'none'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['blue', 'yellow', 'yellow', 'yellow', 'green'],
      ['green', 'yellow', 'yellow', 'yellow', 'green'],
      ['none', 'orange', 'orange', 'red', 'none'],
    ]);
  });

  it('uses the configured side colors for Ra', () => {
    expect(PLL_CASES.find((item) => item.number === 'Ra')?.pattern).toEqual([
      ['none', 'orange', 'blue', 'red', 'none'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['green', 'yellow', 'yellow', 'yellow', 'orange'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'red', 'green', 'none'],
    ]);
  });

  it('uses the configured side colors for Rb', () => {
    expect(PLL_CASES.find((item) => item.number === 'Rb')?.pattern).toEqual([
      ['none', 'orange', 'blue', 'red', 'none'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'orange', 'green', 'none'],
    ]);
  });

  it('uses the configured side colors for T', () => {
    expect(PLL_CASES.find((item) => item.number === 'T')?.pattern).toEqual([
      ['none', 'blue', 'blue', 'orange', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'green'],
      ['orange', 'yellow', 'yellow', 'yellow', 'red'],
      ['red', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'green', 'green', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Ua', () => {
    expect(PLL_CASES.find((item) => item.number === 'Ua')?.pattern).toEqual([
      ['none', 'blue', 'blue', 'blue', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['green', 'yellow', 'yellow', 'yellow', 'red'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'orange', 'green', 'none'],
    ]);
  });

  it('uses the configured side colors for Ub', () => {
    expect(PLL_CASES.find((item) => item.number === 'Ub')?.pattern).toEqual([
      ['none', 'blue', 'blue', 'blue', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['orange', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'red', 'green', 'none'],
    ]);
  });

  it('uses the configured side colors for V', () => {
    expect(PLL_CASES.find((item) => item.number === 'V')?.pattern).toEqual([
      ['none', 'red', 'green', 'orange', 'none'],
      ['green', 'yellow', 'yellow', 'yellow', 'green'],
      ['blue', 'yellow', 'yellow', 'yellow', 'orange'],
      ['blue', 'yellow', 'yellow', 'yellow', 'blue'],
      ['none', 'red', 'red', 'orange', 'none'],
    ]);
  });

  it('uses the configured side colors for Y', () => {
    expect(PLL_CASES.find((item) => item.number === 'Y')?.pattern).toEqual([
      ['none', 'green', 'red', 'blue', 'none'],
      ['orange', 'yellow', 'yellow', 'yellow', 'orange'],
      ['blue', 'yellow', 'yellow', 'yellow', 'orange'],
      ['red', 'yellow', 'yellow', 'yellow', 'red'],
      ['none', 'green', 'green', 'blue', 'none'],
    ]);
  });

  it('uses the configured side colors for Z', () => {
    expect(PLL_CASES.find((item) => item.number === 'Z')?.pattern).toEqual([
      ['none', 'blue', 'red', 'blue', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['blue', 'yellow', 'yellow', 'yellow', 'green'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'orange', 'green', 'none'],
    ]);
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
