import { CubePattern, StickerColor } from './cube.models';

export type CubeFace = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
export type CubeColor = Exclude<StickerColor, 'none'>;
export type CubeFaceState = ReadonlyArray<ReadonlyArray<CubeColor>>;
export type CubeFaces = Readonly<Record<CubeFace, CubeFaceState>>;
export type CubeNet = ReadonlyArray<ReadonlyArray<StickerColor>>;

interface Sticker {
  position: Vector;
  normal: Vector;
  color: CubeColor;
}

type Vector = [number, number, number];
type Axis = 0 | 1 | 2;
type QuarterTurn = -1 | 1 | 2;

interface ParsedMove {
  move: string;
  turn: QuarterTurn;
}

interface MoveDefinition {
  axis: Axis;
  includesLayer: (coordinate: number) => boolean;
  clockwise: -1 | 1;
}

const FACE_COLORS: Readonly<Record<CubeFace, CubeColor>> = {
  U: 'yellow',
  R: 'red',
  F: 'blue',
  D: 'white',
  L: 'orange',
  B: 'green',
};

const FACE_NORMALS: Readonly<Record<CubeFace, Vector>> = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
};

const MOVE_DEFINITIONS: Readonly<Record<string, MoveDefinition>> = {
  R: { axis: 0, includesLayer: (value) => value === 1, clockwise: -1 },
  L: { axis: 0, includesLayer: (value) => value === -1, clockwise: 1 },
  U: { axis: 1, includesLayer: (value) => value === 1, clockwise: -1 },
  D: { axis: 1, includesLayer: (value) => value === -1, clockwise: 1 },
  F: { axis: 2, includesLayer: (value) => value === 1, clockwise: -1 },
  B: { axis: 2, includesLayer: (value) => value === -1, clockwise: 1 },
  Rw: { axis: 0, includesLayer: (value) => value >= 0, clockwise: -1 },
  Lw: { axis: 0, includesLayer: (value) => value <= 0, clockwise: 1 },
  Uw: { axis: 1, includesLayer: (value) => value >= 0, clockwise: -1 },
  Dw: { axis: 1, includesLayer: (value) => value <= 0, clockwise: 1 },
  Fw: { axis: 2, includesLayer: (value) => value >= 0, clockwise: -1 },
  Bw: { axis: 2, includesLayer: (value) => value <= 0, clockwise: 1 },
  M: { axis: 0, includesLayer: (value) => value === 0, clockwise: 1 },
  E: { axis: 1, includesLayer: (value) => value === 0, clockwise: 1 },
  S: { axis: 2, includesLayer: (value) => value === 0, clockwise: -1 },
  x: { axis: 0, includesLayer: () => true, clockwise: -1 },
  y: { axis: 1, includesLayer: () => true, clockwise: -1 },
  z: { axis: 2, includesLayer: () => true, clockwise: -1 },
};

export function invertAlgorithm(algorithm: string): string {
  return parseAlgorithm(algorithm)
    .reverse()
    .map(({ move, turn }) => move + (turn === 2 ? '2' : turn === -1 ? '' : "'"))
    .join(' ');
}

export function cubeFacesFromScramble(scramble: string): CubeFaces {
  const stickers = createSolvedStickers();
  for (const parsedMove of parseAlgorithm(scramble)) applyMove(stickers, parsedMove);
  return stickersToFaces(stickers);
}

export function cubeNetFromScramble(scramble: string): CubeNet {
  const faces = cubeFacesFromScramble(scramble);
  const net = Array.from({ length: 9 }, () => Array<StickerColor>(12).fill('none'));

  placeFace(net, faces.U, 0, 3);
  placeFace(net, faces.L, 3, 0);
  placeFace(net, faces.F, 3, 3);
  placeFace(net, faces.R, 3, 6);
  placeFace(net, faces.B, 3, 9);
  placeFace(net, faces.D, 6, 3);

  return net;
}

export function topLayerPatternFromScramble(scramble: string): CubePattern {
  const faces = cubeFacesFromScramble(scramble);
  return [
    ['none', ...[...faces.B[0]].reverse(), 'none'],
    [faces.L[0][0], ...faces.U[0], faces.R[0][2]],
    [faces.L[0][1], ...faces.U[1], faces.R[0][1]],
    [faces.L[0][2], ...faces.U[2], faces.R[0][0]],
    ['none', ...faces.F[0], 'none'],
  ];
}

export function topLayerOrientationPatternFromScramble(scramble: string): CubePattern {
  return topLayerPatternFromScramble(scramble).map((row) =>
    row.map((color) => (color === 'yellow' ? 'yellow' : 'none')),
  );
}

function createSolvedStickers(): Sticker[] {
  const stickers: Sticker[] = [];
  for (const face of Object.keys(FACE_NORMALS) as CubeFace[]) {
    const normal = FACE_NORMALS[face];
    for (let first = -1; first <= 1; first++) {
      for (let second = -1; second <= 1; second++) {
        stickers.push({
          position: positionFor(face, normal, first, second),
          normal: [...normal],
          color: FACE_COLORS[face],
        });
      }
    }
  }
  return stickers;
}

function positionFor(face: CubeFace, normal: Vector, first: number, second: number): Vector {
  if (face === 'U' || face === 'D') return [first, normal[1], second];
  if (face === 'R' || face === 'L') return [normal[0], first, second];
  return [first, second, normal[2]];
}

function parseAlgorithm(algorithm: string): ParsedMove[] {
  let position = 0;

  function parseSequence(inGroup: boolean): ParsedMove[] {
    const moves: ParsedMove[] = [];
    while (position < algorithm.length) {
      skipWhitespace();
      if (position >= algorithm.length) break;
      if (algorithm[position] === ')') {
        if (!inGroup) throw notationError('unexpected closing parenthesis');
        position++;
        return moves;
      }
      if (algorithm[position] === '(') {
        position++;
        const group = parseSequence(true);
        const repetitions = readRepetitions();
        for (let index = 0; index < repetitions; index++) moves.push(...group);
        continue;
      }
      moves.push(readMove());
    }
    if (inGroup) throw notationError('unclosed parenthesis');
    return moves;
  }

  function skipWhitespace(): void {
    while (/\s/.test(algorithm[position] ?? '')) position++;
  }

  function readRepetitions(): number {
    skipWhitespace();
    const match = /^\d+/.exec(algorithm.slice(position));
    if (!match) return 1;
    position += match[0].length;
    const repetitions = Number(match[0]);
    if (repetitions < 1) throw notationError('group repetition must be positive');
    return repetitions;
  }

  function readMove(): ParsedMove {
    const rest = algorithm.slice(position);
    const match = /^([URFDLB](?:w)?|[urfdlb]|[MESxyz])(2'?|')?/.exec(rest);
    if (!match) throw notationError(`unsupported token near "${rest.slice(0, 12)}"`);
    position += match[0].length;

    const rawMove = match[1];
    const move = /^[urfdlb]$/.test(rawMove) ? `${rawMove.toUpperCase()}w` : rawMove;
    const suffix = match[2] ?? '';
    return { move, turn: suffix.startsWith('2') ? 2 : suffix === "'" ? -1 : 1 };
  }

  function notationError(message: string): Error {
    return new Error(`Invalid cube notation at position ${position}: ${message}`);
  }

  return parseSequence(false);
}

function applyMove(stickers: Sticker[], parsedMove: ParsedMove): void {
  const definition = MOVE_DEFINITIONS[parsedMove.move];
  if (!definition) throw new Error(`Unsupported cube move: ${parsedMove.move}`);
  const quarterTurns =
    parsedMove.turn === 2 ? 2 : ((definition.clockwise * parsedMove.turn) as -1 | 1);

  for (const sticker of stickers) {
    if (!definition.includesLayer(sticker.position[definition.axis])) continue;
    sticker.position = rotateVector(sticker.position, definition.axis, quarterTurns);
    sticker.normal = rotateVector(sticker.normal, definition.axis, quarterTurns);
  }
}

function rotateVector(vector: Vector, axis: Axis, quarterTurns: QuarterTurn): Vector {
  let [x, y, z] = vector;
  const repetitions = quarterTurns === -1 ? 3 : quarterTurns;
  for (let index = 0; index < repetitions; index++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [x, z] = [z, -x];
    else [x, y] = [-y, x];
  }
  return [x, y, z];
}

function stickersToFaces(stickers: Sticker[]): CubeFaces {
  const faces = Object.fromEntries(
    (Object.keys(FACE_NORMALS) as CubeFace[]).map((face) => [
      face,
      Array.from({ length: 3 }, () => Array<CubeColor>(3)),
    ]),
  ) as Record<CubeFace, CubeColor[][]>;

  for (const sticker of stickers) {
    const face = faceForNormal(sticker.normal);
    const [row, column] = faceCoordinates(face, sticker.position);
    faces[face][row][column] = sticker.color;
  }
  return faces;
}

function faceForNormal(normal: Vector): CubeFace {
  const entry = (Object.entries(FACE_NORMALS) as Array<[CubeFace, Vector]>).find(([, candidate]) =>
    candidate.every((value, index) => value === normal[index]),
  );
  if (!entry) throw new Error(`Invalid sticker normal: ${normal.join(',')}`);
  return entry[0];
}

function faceCoordinates(face: CubeFace, [x, y, z]: Vector): [number, number] {
  if (face === 'U') return [z + 1, x + 1];
  if (face === 'D') return [1 - z, x + 1];
  if (face === 'F') return [1 - y, x + 1];
  if (face === 'B') return [1 - y, 1 - x];
  if (face === 'R') return [1 - y, 1 - z];
  return [1 - y, z + 1];
}

function placeFace(
  net: StickerColor[][],
  face: CubeFaceState,
  startRow: number,
  startColumn: number,
): void {
  face.forEach((row, rowIndex) =>
    row.forEach((color, columnIndex) => {
      net[startRow + rowIndex][startColumn + columnIndex] = color;
    }),
  );
}
