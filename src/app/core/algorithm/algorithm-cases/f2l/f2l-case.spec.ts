import { cubeFacesFromScramble } from '../../../cube/cube-state';
import { F2L_CASES } from './index';
import { defineF2lCase, f2lCaseForSlot } from './f2l-case';

describe('F2Lケース定義', () => {
  it('41ケースが共通番号と分類の下に4スロットの独立した手順を持つ', () => {
    expect(F2L_CASES.map(({ number }) => number)).toEqual(
      Array.from({ length: 41 }, (_, index) => String(index + 1).padStart(2, '0')),
    );
    for (const item of F2L_CASES) {
      expect(item.setup).toMatch(/^[URFDLB2' ]+$/);
      expect(item).not.toHaveProperty('algorithms');
      expect(Object.keys(item.slots)).toEqual(['FR', 'FL', 'BL', 'BR']);
      for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
        const ids = new Set<string>();
        const data = item.slots[slot];
        expect(data).not.toHaveProperty('setup');
        expect(data.algorithms.length).toBeGreaterThan(0);
        expect(new Set(data.algorithms.map(({ notation }) => notation)).size).toBe(
          data.algorithms.length,
        );
        for (const algorithm of data.algorithms) {
          expect(algorithm.id).not.toContain('dummy');
          expect(ids.has(algorithm.id)).toBe(false);
          ids.add(algorithm.id);
          expect(algorithm.builtIn).toBe(true);
          // 組み込み手順のWide Moveは小文字ではなくRwなどの明示表記で統一する。
          expect(algorithm.notation).not.toMatch(/(?:^|[\s(])[urfdlb](?=[2'\s)]|$)/);
        }
        expect(f2lCaseForSlot(item, slot)).toEqual({
          kind: 'F2L',
          number: item.number,
          group: item.group,
          slot,
          setup: item.setup + { FR: '', FL: ' y', BL: ' y2', BR: " y'" }[slot],
          ...data,
        });
      }
    }
  });

  for (const item of F2L_CASES) {
    for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
      it(`${item.number}/${slot}の全手順がSetupからクロスと4ペアを完成させる`, () => {
        const data = f2lCaseForSlot(item, slot);
        const setup = cubeFacesFromScramble(data.setup);
        // 外層回転Setupで白クロスが保たれる。
        for (const index of [1, 3, 4, 5, 7]) expect(setup.D.flat()[index]).toBe('white');
        for (const face of ['F', 'R', 'B', 'L'] as const) {
          expect(setup[face][2][1]).toBe(setup[face][1][1]);
        }
        for (const algorithm of data.algorithms) {
          const result = cubeFacesFromScramble(`${data.setup} ${algorithm.notation}`);
          expect(result.D.flat(), algorithm.notation).toEqual(Array(9).fill(result.D[1][1]));
          for (const face of ['F', 'R', 'B', 'L'] as const) {
            expect(result[face].slice(1).flat(), algorithm.notation).toEqual(
              Array(6).fill(result[face][1][1]),
            );
          }
        }
      });
    }
  }

  it('元配列を変更せず手順順序と共通Setupを保持する', () => {
    const data = {
      algorithms: [
        { id: 'first', notation: 'R' },
        { id: 'second', notation: 'U' },
      ],
    };
    const item = defineF2lCase({
      number: '01',
      group: 'test',
      setup: 'U',
      slots: { FR: data, FL: data, BL: data, BR: data },
    });
    expect(item.slots.FR.algorithms.map(({ id }) => id)).toEqual(['first', 'second']);
    expect(item.slots.FR.algorithms).not.toBe(item.slots.FL.algorithms);
    expect(data.algorithms[0]).not.toHaveProperty('builtIn');
  });
});
