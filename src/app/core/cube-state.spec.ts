import { describe, expect, it } from 'vitest';
import {
  cubeFacesFromScramble,
  invertAlgorithm,
  topLayerOrientationPatternFromScramble,
  cubeNetFromScramble,
  topLayerPatternFromScramble,
} from './cube-state';

describe('cube state', () => {
  it('returns the solved color scheme for an empty scramble', () => {
    const faces = cubeFacesFromScramble('');

    expect(faces.U.flat()).toEqual(Array(9).fill('yellow'));
    expect(faces.R.flat()).toEqual(Array(9).fill('red'));
    expect(faces.F.flat()).toEqual(Array(9).fill('blue'));
    expect(faces.D.flat()).toEqual(Array(9).fill('white'));
    expect(faces.L.flat()).toEqual(Array(9).fill('orange'));
    expect(faces.B.flat()).toEqual(Array(9).fill('green'));
  });

  it('applies a clockwise R turn with standard face orientation', () => {
    const faces = cubeFacesFromScramble('R');

    expect(faces.U.map((row) => row[2])).toEqual(['blue', 'blue', 'blue']);
    expect(faces.F.map((row) => row[2])).toEqual(['white', 'white', 'white']);
    expect(faces.D.map((row) => row[2])).toEqual(['green', 'green', 'green']);
    expect(faces.B.map((row) => row[0])).toEqual(['yellow', 'yellow', 'yellow']);
    expect(faces.R.flat()).toEqual(Array(9).fill('red'));
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
      'orange',
      'orange',
      'orange',
      'blue',
      'blue',
      'blue',
      'red',
      'red',
      'red',
      'green',
      'green',
      'green',
    ]);
  });

  it('creates the existing 5x5 top-layer pattern format', () => {
    expect(topLayerPatternFromScramble('')).toEqual([
      ['none', 'green', 'green', 'green', 'none'],
      ['orange', 'yellow', 'yellow', 'yellow', 'red'],
      ['orange', 'yellow', 'yellow', 'yellow', 'red'],
      ['orange', 'yellow', 'yellow', 'yellow', 'red'],
      ['none', 'blue', 'blue', 'blue', 'none'],
    ]);
  });

  it('rejects unsupported or malformed notation', () => {
    expect(() => cubeFacesFromScramble('R Q')).toThrow(/Invalid cube notation/);
    expect(() => cubeFacesFromScramble('(R U')).toThrow(/unclosed parenthesis/);
    expect(() => cubeFacesFromScramble('R)')).toThrow(/unexpected closing parenthesis/);
  });
});
