import { describe, expect, it } from 'vitest';
import {
  cubeFacesFromScramble,
  invertAlgorithm,
  isCubeSolved,
  isOllSolved,
  isPllSolved,
  topLayerOrientationPatternFromScramble,
  cubeNetFromScramble,
  topLayerPatternFromScramble,
} from './cube-state';

describe('cube state', () => {
  it('returns the solved color scheme for an empty scramble', () => {
    const faces = cubeFacesFromScramble('');

    expect(faces.U.flat()).toEqual(Array(9).fill('yellow'));
    expect(faces.R.flat()).toEqual(Array(9).fill('orange'));
    expect(faces.F.flat()).toEqual(Array(9).fill('green'));
    expect(faces.D.flat()).toEqual(Array(9).fill('white'));
    expect(faces.L.flat()).toEqual(Array(9).fill('red'));
    expect(faces.B.flat()).toEqual(Array(9).fill('blue'));
  });

  it('supports the white-top, green-front scramble orientation', () => {
    const faces = cubeFacesFromScramble('', 'white-top');

    expect(faces.U.flat()).toEqual(Array(9).fill('white'));
    expect(faces.R.flat()).toEqual(Array(9).fill('red'));
    expect(faces.F.flat()).toEqual(Array(9).fill('green'));
    expect(faces.D.flat()).toEqual(Array(9).fill('yellow'));
    expect(faces.L.flat()).toEqual(Array(9).fill('orange'));
    expect(faces.B.flat()).toEqual(Array(9).fill('blue'));
  });

  it('applies a clockwise R turn with standard face orientation', () => {
    const faces = cubeFacesFromScramble('R');

    expect(faces.U.map((row) => row[2])).toEqual(['green', 'green', 'green']);
    expect(faces.F.map((row) => row[2])).toEqual(['white', 'white', 'white']);
    expect(faces.D.map((row) => row[2])).toEqual(['blue', 'blue', 'blue']);
    expect(faces.B.map((row) => row[0])).toEqual(['yellow', 'yellow', 'yellow']);
    expect(faces.R.flat()).toEqual(Array(9).fill('orange'));
  });

  it('supports inverse, double, wide, slice, rotation, and grouped moves', () => {
    expect(cubeFacesFromScramble("R U R' U' U R U' R'")).toEqual(cubeFacesFromScramble(''));
    expect(cubeFacesFromScramble('R2 R2')).toEqual(cubeFacesFromScramble(''));
    expect(cubeFacesFromScramble("r U M' x y2 z'")).toEqual(
      cubeFacesFromScramble("Rw U M' x y2 z'"),
    );
    expect(cubeFacesFromScramble("(R U R' U')2")).toEqual(
      cubeFacesFromScramble("R U R' U' R U R' U'"),
    );
  });

  it('treats lowercase face moves as wide moves', () => {
    const lowercase = "f b' r2 l u' d2";
    const explicitWide = "Fw Bw' Rw2 Lw Uw' Dw2";

    expect(cubeFacesFromScramble(lowercase)).toEqual(cubeFacesFromScramble(explicitWide));
  });

  it('inverts normalized algorithms and expands groups', () => {
    expect(invertAlgorithm("(R U R' U')2 f")).toBe("Fw' U R U' R' U R U' R'");
    expect(topLayerOrientationPatternFromScramble(invertAlgorithm("R U R' U R U2 R'"))).toEqual([
      ['none', 'yellow', 'none', 'none', 'none'],
      ['none', 'none', 'yellow', 'none', 'yellow'],
      ['none', 'yellow', 'yellow', 'yellow', 'none'],
      ['none', 'yellow', 'yellow', 'none', 'none'],
      ['none', 'none', 'none', 'yellow', 'none'],
    ]);
  });

  it('judges OLL completion from the face with the yellow center after cube rotations', () => {
    for (const rotation of ["x'", 'x', 'y', 'z']) {
      expect(isOllSolved(cubeFacesFromScramble(rotation))).toBe(true);
    }
  });

  it('rejects OLL completion when the yellow-center face contains another color', () => {
    expect(isOllSolved(cubeFacesFromScramble("x' R"))).toBe(false);
  });

  it('judges cube completion from each center color after cube rotations', () => {
    for (const rotation of ["x'", 'x', 'y', 'z']) {
      expect(isCubeSolved(cubeFacesFromScramble(rotation))).toBe(true);
    }
  });

  it('rejects cube completion when a face contains a color different from its center', () => {
    expect(isCubeSolved(cubeFacesFromScramble('z R'))).toBe(false);
  });

  it('judges PLL completion from the yellow face and four adjacent color bars', () => {
    for (const rotation of ["x'", 'x', 'y', 'z']) {
      expect(isPllSolved(cubeFacesFromScramble(rotation))).toBe(true);
    }
    expect(isPllSolved(cubeFacesFromScramble('U'))).toBe(true);
    expect(isPllSolved(cubeFacesFromScramble('D'))).toBe(true);
    expect(isCubeSolved(cubeFacesFromScramble('D'))).toBe(false);
  });

  it('rejects PLL completion when the yellow face or an adjacent color bar is unsolved', () => {
    expect(isPllSolved(cubeFacesFromScramble('R'))).toBe(false);
  });

  it('creates a 9x12 cube net with the conventional face layout', () => {
    const net = cubeNetFromScramble('');

    expect(net).toHaveLength(9);
    net.forEach((row) => expect(row).toHaveLength(12));
    expect(net.slice(0, 3).map((row) => row.slice(3, 6).flat())).toEqual([
      ['yellow', 'yellow', 'yellow'],
      ['yellow', 'yellow', 'yellow'],
      ['yellow', 'yellow', 'yellow'],
    ]);
    expect(net.flat().filter((color) => color !== 'none')).toHaveLength(54);
    expect(net[4].slice(0, 12)).toEqual([
      'red',
      'red',
      'red',
      'green',
      'green',
      'green',
      'orange',
      'orange',
      'orange',
      'blue',
      'blue',
      'blue',
    ]);
  });

  it('creates the existing 5x5 top-layer pattern format', () => {
    expect(topLayerPatternFromScramble('')).toEqual([
      ['none', 'blue', 'blue', 'blue', 'none'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['red', 'yellow', 'yellow', 'yellow', 'orange'],
      ['none', 'green', 'green', 'green', 'none'],
    ]);
  });

  it('rejects unsupported or malformed notation', () => {
    expect(() => cubeFacesFromScramble('R Q')).toThrow(/Invalid cube notation/);
    expect(() => cubeFacesFromScramble('(R U')).toThrow(/unclosed parenthesis/);
    expect(() => cubeFacesFromScramble('R)')).toThrow(/unexpected closing parenthesis/);
  });
});
