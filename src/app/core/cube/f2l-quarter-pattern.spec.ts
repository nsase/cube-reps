import {
  cubeFacesFromScramble,
  f2lQuarterPatternFromScramble,
  invertAlgorithm,
} from './cube-state';

describe('F2Lクォータービューの認識図', () => {
  it('完成状態の最終層を灰色にし、白下・緑正面の前面と右面の下2段を残す', () => {
    const pattern = f2lQuarterPatternFromScramble('');
    expect(pattern.U).toEqual(Array.from({ length: 3 }, () => Array(3).fill('none')));
    expect(pattern.F).toEqual([
      ['none', 'none', 'none'],
      ['green', 'green', 'green'],
      ['green', 'green', 'green'],
    ]);
    expect(pattern.R).toEqual([
      ['none', 'none', 'none'],
      ['orange', 'orange', 'orange'],
      ['orange', 'orange', 'orange'],
    ]);
  });

  it('最終層ピースが下段へ動いても全ステッカーを灰色にする', () => {
    const pattern = f2lQuarterPatternFromScramble('R2');
    // UFRの黄色・緑・オレンジのコーナーはDBRへ移る。右面下段の後方も灰色にする。
    expect(pattern.R[2][2]).toBe('none');
    // DFRの白いコーナーはUBRへ移り、上面の白はF2L対象として表示する。
    expect(pattern.U[0][2]).toBe('white');
    expect(pattern.R[0][2]).toBe('orange');
    expect(pattern.F[1][1]).toBe('green');
  });

  it('Setup変更に追従し、逆手順で完成状態の認識図へ戻る', () => {
    const setup = "R U R' U'";
    const pattern = f2lQuarterPatternFromScramble(setup);
    expect(pattern).not.toEqual(f2lQuarterPatternFromScramble(''));
    const faces = cubeFacesFromScramble(setup);
    for (const face of ['U', 'F', 'R'] as const) {
      pattern[face].forEach((row, y) =>
        row.forEach((color, x) => {
          expect(color === 'none' || color === faces[face][y][x]).toBe(true);
          expect(color).not.toBe('yellow');
        }),
      );
    }
    expect(f2lQuarterPatternFromScramble(`${setup} ${invertAlgorithm(setup)}`)).toEqual(
      f2lQuarterPatternFromScramble(''),
    );
  });
});
