import { describe, expect, it } from 'vitest';
import { OLL_CASES, PLL_CASES } from './algorithm-cases';
import {
  cubeFacesFromScramble,
  isCubeSolved,
  isOllSolved,
  topLayerOrientationPatternFromScramble,
  topLayerPatternFromScramble,
} from './cube-state';

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
      const pattern = topLayerOrientationPatternFromScramble(item.setup);
      const yellowCount = pattern.flat().filter((color) => color === 'yellow').length;
      expect(yellowCount).toBe(9);
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
    const notation = cases
      .flatMap((item) => item.algorithms.map(({ notation }) => notation))
      .join(' ');
    expect(notation).not.toMatch(/[\[\]{}]/);
  });

  it('uses w notation for wide moves', () => {
    const notation = cases
      .flatMap((item) => item.algorithms.map(({ notation }) => notation))
      .join(' ');
    expect(notation).not.toMatch(/(?:^|[^A-Za-z])[udrlfb](?:2|'|\s)/m);
  });

  it('uses a unique UUID for every built-in algorithm', () => {
    const ids = cases.flatMap((item) => item.algorithms.map(({ id }) => id));

    expect(
      ids.every((id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id),
      ),
    ).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('generates a 5x5 display pattern from every OLL and PLL Setup', () => {
    expect(cases).toHaveLength(78);
    for (const item of cases) {
      const pattern =
        item.kind === 'OLL'
          ? topLayerOrientationPatternFromScramble(item.setup)
          : topLayerPatternFromScramble(item.setup);
      expect(pattern).toHaveLength(5);
      pattern.forEach((row) => expect(row).toHaveLength(5));
    }
  });

  it('provides a fixed Setup using only outer moves and the allowed M slice move', () => {
    for (const item of cases) {
      expect
        .soft(item.setup, `${item.kind} ${item.number}`)
        .toMatch(/^(?:[UDLRFBM](?:2|')?)(?: [UDLRFBM](?:2|')?)*$/);
    }
  });

  it('uses M moves only in the intentionally selected Setup cases', () => {
    expect(cases.filter(({ setup }) => /(?:^| )M(?:2|')?(?: |$)/.test(setup)).map(itemKey)).toEqual(
      ['OLL 19', 'PLL H'],
    );
  });

  it('solves every complete Setup state with a corresponding algorithm while preserving F2L', () => {
    for (const item of cases) {
      expect
        .soft(
          item.algorithms.some(({ notation }) => {
            const faces = cubeFacesFromScramble(`${item.setup} ${withoutInitialY(notation)}`);
            return item.kind === 'OLL' ? isOllSolved(faces) : isCubeSolved(faces);
          }),
          itemKey(item),
        )
        .toBe(true);
      expect.soft(hasSolvedF2L(item.setup), itemKey(item)).toBe(true);
    }
  });

  it('leaves the four generated pattern corners empty', () => {
    for (const item of cases) {
      const pattern = topLayerPatternFromScramble(item.setup);
      expect(pattern[0][0]).toBe('none');
      expect(pattern[0][4]).toBe('none');
      expect(pattern[4][0]).toBe('none');
      expect(pattern[4][4]).toBe('none');
    }
  });

  it('uses only yellow and none for OLL patterns generated from Setup', () => {
    for (const item of OLL_CASES) {
      const colors = new Set(topLayerOrientationPatternFromScramble(item.setup).flat());
      expect([...colors].every((color) => color === 'yellow' || color === 'none')).toBe(true);
      expect(colors.has('none')).toBe(true);
    }
  });
});

/** @returns ケース種別と識別子を結合したテスト表示用のキー */
function itemKey(item: import('./cube.models').AlgorithmCase): string {
  return `${item.kind} ${item.number}`;
}

/** @returns 解法開始前の持ち替えとして記録された先頭のy回転を除いた手順 */
function withoutInitialY(notation: string): string {
  return notation.replace(/^\s*(?:(?:\(\s*y(?:2|')?\s*\)|y(?:2|')?)\s*)+/, '');
}

/** @returns Setup適用後も下面と側面下2段が完成している場合は`true` */
function hasSolvedF2L(setup: string): boolean {
  const faces = cubeFacesFromScramble(setup);
  const downIsSolved = faces.D.flat().every((color) => color === faces.D[1][1]);
  const sidesAreSolved = (['F', 'R', 'B', 'L'] as const).every((face) =>
    faces[face]
      .slice(1)
      .flat()
      .every((color) => color === faces[face][1][1]),
  );
  return downIsSolved && sidesAreSolved;
}
