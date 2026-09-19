import { F2L_CASES } from './index';
import { defineF2lCase } from './f2l-case';

describe('F2Lケース定義', () => {
  it('41ファイルのケースを番号順にまとめ、基準スロットとダミー手順を持つ', () => {
    expect(F2L_CASES.map(({ number }) => number)).toEqual(
      Array.from({ length: 41 }, (_, index) => String(index + 1)),
    );
    expect(new Set(F2L_CASES.map(({ id }) => id)).size).toBe(41);
    for (const item of F2L_CASES) {
      expect(item.kind).toBe('F2L');
      expect(item.name).toBe(`F2L ${item.number}`);
      expect(item.slot).toBe('FR');
      expect(item.setup).toBe("R U' R'");
      expect(item.algorithms).toEqual([
        { id: `${item.id}-dummy`, notation: "R U R'", builtIn: true },
      ]);
    }
  });

  it('各スロットの指定と手順の順序を保持し、表示番号から独立したIDを維持する', () => {
    const algorithms = [
      { id: 'first', notation: 'R' },
      { id: 'second', notation: 'U' },
    ];
    for (const slot of ['FL', 'FR', 'BL', 'BR'] as const) {
      const item = defineF2lCase({ id: 'stable-id', number: '12', slot, setup: 'U', algorithms });
      expect(item.slot).toBe(slot);
      expect(item.id).toBe('stable-id');
      expect(item.algorithms).toEqual(
        algorithms.map((algorithm) => ({ ...algorithm, builtIn: true })),
      );
      expect(defineF2lCase({ ...item, number: '13' }).id).toBe(item.id);
    }
    expect(algorithms[0]).not.toHaveProperty('builtIn');
  });
});
