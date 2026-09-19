import { F2L_CASES } from './index';
import { defineF2lCase } from './f2l-case';

describe('F2Lケース定義', () => {
  it('41ファイルのケースを番号順にまとめ、基準スロットとダミー手順を持つ', () => {
    expect(F2L_CASES.map(({ number }) => number)).toEqual(
      Array.from({ length: 41 }, (_, index) => String(index + 1)),
    );
    expect(new Set(F2L_CASES.map(({ number }) => number)).size).toBe(41);
    for (const item of F2L_CASES) {
      expect(item.kind).toBe('F2L');
      expect(item.name).toBe(`F2L ${item.number}`);
      expect(item.slot).toBe('FR');
      expect(item.setup).toBe("R U' R'");
      expect(item.algorithms).toEqual([
        { id: expect.any(String), notation: "R U R'", builtIn: true },
      ]);
    }
  });

  it('各スロットの指定と手順の順序を保持する', () => {
    const algorithms = [
      { id: 'first', notation: 'R' },
      { id: 'second', notation: 'U' },
    ];
    for (const slot of ['FL', 'FR', 'BL', 'BR'] as const) {
      const item = defineF2lCase({ number: '12', slot, setup: 'U', algorithms });
      expect(item.slot).toBe(slot);
      expect(item.algorithms).toEqual(
        algorithms.map((algorithm) => ({ ...algorithm, builtIn: true })),
      );
    }
    expect(algorithms[0]).not.toHaveProperty('builtIn');
  });
});
