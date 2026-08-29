import { CubePattern, StickerColor } from './cube.models';

/** キューブの6面を表すSingmaster記号。 */
export type CubeFace = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
/** 未配置色を除いた実ステッカー色。 */
export type CubeColor = Exclude<StickerColor, 'none'>;
/** キューブを観察する基準面。 */
export type CubeOrientation = 'yellow-top' | 'white-top';
/** 1面分の3行3列ステッカー。 */
export type CubeFaceState = ReadonlyArray<ReadonlyArray<CubeColor>>;
/** 面記号をキーとする6面分の状態。 */
export type CubeFaces = Readonly<Record<CubeFace, CubeFaceState>>;
/** 6面を9行12列へ配置した展開図。 */
export type CubeNet = ReadonlyArray<ReadonlyArray<StickerColor>>;

/** 3次元座標上に配置した1枚のステッカー。 */
interface Sticker {
  /** キューブ中心を原点とするステッカー位置。 */
  position: Vector;
  /** ステッカーが向いている面の法線。 */
  normal: Vector;
  /** ステッカー色。 */
  color: CubeColor;
}

/** 各要素が`-1`から`1`の3次元ベクトル。 */
type Vector = [number, number, number];
/** 回転軸。`0`、`1`、`2`はそれぞれx、y、z軸。 */
type Axis = 0 | 1 | 2;
/** 90度単位の回転量。 */
type QuarterTurn = -1 | 1 | 2;

/** パース済みの1手。 */
interface ParsedMove {
  /** 正規化された手の名前。 */
  move: string;
  /** 時計回り、反時計回り、180度の回転量。 */
  turn: QuarterTurn;
}

/** 1種類の手が動かす層と回転方向。 */
interface MoveDefinition {
  /** 回転させる軸。 */
  axis: Axis;
  /** 指定座標の層が回転対象かを判定する関数。 */
  includesLayer: (coordinate: number) => boolean;
  /** 基本手を時計回りに実行するときの座標回転方向。 */
  clockwise: -1 | 1;
}

/** 観察方向ごとの完成状態の面色。 */
const FACE_COLORS: Readonly<Record<CubeOrientation, Readonly<Record<CubeFace, CubeColor>>>> = {
  'yellow-top': { U: 'yellow', R: 'orange', F: 'green', D: 'white', L: 'red', B: 'blue' },
  'white-top': { U: 'white', R: 'red', F: 'green', D: 'yellow', L: 'orange', B: 'blue' },
};

/** 各面が向いている単位法線ベクトル。 */
const FACE_NORMALS: Readonly<Record<CubeFace, Vector>> = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
};

/** 対応するキューブ記法ごとの回転定義。 */
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

/**
 * キューブ手順を逆順かつ逆回転へ変換する。
 *
 * @param algorithm 反転するキューブ手順
 * @returns 入力と逆の状態遷移を行う手順
 * @throws 記法に未対応のトークンや不正な括弧が含まれる場合
 */
export function invertAlgorithm(algorithm: string): string {
  return parseAlgorithm(algorithm)
    .reverse()
    .map(({ move, turn }) => move + (turn === 2 ? '2' : turn === -1 ? '' : "'"))
    .join(' ');
}

/**
 * 完成状態へスクランブルを適用し、6面の状態を返す。
 *
 * @param scramble 適用するキューブ手順
 * @param orientation 完成状態を観察する向き
 * @returns スクランブル適用後の6面
 */
export function cubeFacesFromScramble(
  scramble: string,
  orientation: CubeOrientation = 'yellow-top',
): CubeFaces {
  const stickers = createSolvedStickers(orientation);
  for (const parsedMove of parseAlgorithm(scramble)) applyMove(stickers, parsedMove);
  return stickersToFaces(stickers);
}

/**
 * 黄色センターが存在する面のステッカーがすべて黄色か判定する。
 * キューブ回転後も空間上の面位置に依存せずOLLの完成を認識するため、センター色を基準にする。
 *
 * @param faces 判定するキューブの6面
 * @returns 黄色センターの面が黄色で揃っている場合は`true`
 */
export function isOllSolved(faces: CubeFaces): boolean {
  const yellowFace = Object.values(faces).find((face) => face[1][1] === 'yellow');
  return yellowFace?.flat().every((color) => color === 'yellow') ?? false;
}

/**
 * 黄色面と、その面へ隣接する側面12枚が最上層として揃っているか判定する。
 * PLLでは最終層の21枚だけを対象とし、反対面や側面の残りは完成判定に含めない。
 * AUFには依存せず、隣接する各3枚が同色であればセンター色との位置関係は問わない。
 *
 * @param faces 判定するキューブの6面
 * @returns 黄色面9枚と隣接する側面12枚が揃っている場合は`true`
 */
export function isPllSolved(faces: CubeFaces): boolean {
  const yellowFace = (Object.keys(faces) as CubeFace[]).find(
    (face) => faces[face][1][1] === 'yellow',
  );
  if (!yellowFace || !faces[yellowFace].flat().every((color) => color === 'yellow')) return false;

  return adjacentLayerStrips(faces, yellowFace).every(({ colors }) =>
    colors.every((color) => color === colors[0]),
  );
}

/**
 * 6面それぞれのステッカーが、その面のセンター色で統一されているか判定する。
 * キューブ全体の向きや配色方向に依存せず完成状態を認識するため、各面のセンター色を基準にする。
 *
 * @param faces 判定するキューブの6面
 * @returns すべての面が各センター色で揃っている場合は`true`
 */
export function isCubeSolved(faces: CubeFaces): boolean {
  return Object.values(faces).every((face) => face.flat().every((color) => color === face[1][1]));
}

/**
 * 基準面に直接接する4面のステッカー列を返す。
 *
 * @param faces 判定するキューブの6面
 * @param referenceFace 隣接層を特定する基準面
 * @returns 隣接面と基準面に接する3枚の組
 */
function adjacentLayerStrips(
  faces: CubeFaces,
  referenceFace: CubeFace,
): Array<{ face: CubeFace; colors: CubeColor[] }> {
  const row = (face: CubeFace, index: number): CubeColor[] => [...faces[face][index]];
  const column = (face: CubeFace, index: number): CubeColor[] =>
    faces[face].map((faceRow) => faceRow[index]);

  if (referenceFace === 'U')
    return (['F', 'R', 'B', 'L'] as const).map((face) => ({ face, colors: row(face, 0) }));
  if (referenceFace === 'D')
    return (['F', 'R', 'B', 'L'] as const).map((face) => ({ face, colors: row(face, 2) }));
  if (referenceFace === 'F')
    return [
      { face: 'U', colors: row('U', 2) },
      { face: 'R', colors: column('R', 0) },
      { face: 'D', colors: row('D', 0) },
      { face: 'L', colors: column('L', 2) },
    ];
  if (referenceFace === 'B')
    return [
      { face: 'U', colors: row('U', 0) },
      { face: 'R', colors: column('R', 2) },
      { face: 'D', colors: row('D', 2) },
      { face: 'L', colors: column('L', 0) },
    ];
  if (referenceFace === 'R')
    return [
      { face: 'U', colors: column('U', 2) },
      { face: 'F', colors: column('F', 2) },
      { face: 'D', colors: column('D', 2) },
      { face: 'B', colors: column('B', 0) },
    ];
  return [
    { face: 'U', colors: column('U', 0) },
    { face: 'F', colors: column('F', 0) },
    { face: 'D', colors: column('D', 0) },
    { face: 'B', colors: column('B', 2) },
  ];
}

/**
 * スクランブル適用後の状態を9行12列の展開図へ変換する。
 *
 * @param scramble 適用するキューブ手順
 * @param orientation 完成状態を観察する向き
 * @returns 面のないセルを`none`で埋めた展開図
 */
export function cubeNetFromScramble(
  scramble: string,
  orientation: CubeOrientation = 'yellow-top',
): CubeNet {
  const faces = cubeFacesFromScramble(scramble, orientation);
  const net = Array.from({ length: 9 }, () => Array<StickerColor>(12).fill('none'));

  placeFace(net, faces.U, 0, 3);
  placeFace(net, faces.L, 3, 0);
  placeFace(net, faces.F, 3, 3);
  placeFace(net, faces.R, 3, 6);
  placeFace(net, faces.B, 3, 9);
  placeFace(net, faces.D, 6, 3);

  return net;
}

/**
 * スクランブル適用後の上面と側面上段を5行5列で返す。
 *
 * @param scramble 適用するキューブ手順
 * @returns OLL/PLL表示用パターン
 */
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

/**
 * 上段パターンから黄色面の向きだけを抽出する。
 *
 * @param scramble 適用するキューブ手順
 * @returns 黄色以外を`none`へ置換したOLL向けパターン
 */
export function topLayerOrientationPatternFromScramble(scramble: string): CubePattern {
  return topLayerPatternFromScramble(scramble).map((row) =>
    row.map((color) => (color === 'yellow' ? 'yellow' : 'none')),
  );
}

/**
 * 指定方向の完成状態を54枚の3次元ステッカーとして生成する。
 *
 * @param orientation キューブを観察する向き
 * @returns 完成状態のステッカー
 */
function createSolvedStickers(orientation: CubeOrientation = 'yellow-top'): Sticker[] {
  const stickers: Sticker[] = [];
  for (const face of Object.keys(FACE_NORMALS) as CubeFace[]) {
    const normal = FACE_NORMALS[face];
    for (let first = -1; first <= 1; first++) {
      for (let second = -1; second <= 1; second++) {
        stickers.push({
          position: positionFor(face, normal, first, second),
          normal: [...normal],
          color: FACE_COLORS[orientation][face],
        });
      }
    }
  }
  return stickers;
}

/**
 * 面内の2次元位置を3次元座標へ変換する。
 *
 * @param face 配置する面
 * @param normal 面の法線
 * @param first 面内の第1座標
 * @param second 面内の第2座標
 * @returns キューブ中心を原点とする座標
 */
function positionFor(face: CubeFace, normal: Vector, first: number, second: number): Vector {
  if (face === 'U' || face === 'D') return [first, normal[1], second];
  if (face === 'R' || face === 'L') return [normal[0], first, second];
  return [first, second, normal[2]];
}

/**
 * 括弧、反復、ワイドムーブを含むキューブ記法を解析する。
 *
 * @param algorithm 解析する手順
 * @returns 正規化された手の一覧
 * @throws 記法が不正または未対応の場合
 */
function parseAlgorithm(algorithm: string): ParsedMove[] {
  let position = 0;

  /**
   * 現在位置から手または括弧グループを再帰的に読み取る。
   *
   * @param inGroup 閉じ括弧を期待する再帰呼び出しかどうか
   * @returns 読み取った手の一覧
   */
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

  /** 現在位置から連続する空白を読み飛ばす。 */
  function skipWhitespace(): void {
    while (/\s/.test(algorithm[position] ?? '')) position++;
  }

  /** @returns 現在位置にある反復回数。省略時は`1` */
  function readRepetitions(): number {
    skipWhitespace();
    const match = /^\d+/.exec(algorithm.slice(position));
    if (!match) return 1;
    position += match[0].length;
    const repetitions = Number(match[0]);
    if (repetitions < 1) throw notationError('group repetition must be positive');
    return repetitions;
  }

  /**
   * 現在位置から1手を読み取り、ワイドムーブ表記を正規化する。
   *
   * @returns パース済みの1手
   */
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

  /**
   * 現在の解析位置を含む記法エラーを生成する。
   *
   * @param message エラーの詳細
   * @returns 呼び出し元から送出するエラー
   */
  function notationError(message: string): Error {
    return new Error(`Invalid cube notation at position ${position}: ${message}`);
  }

  return parseSequence(false);
}

/**
 * 1手を対象層のステッカー位置と法線へ適用する。
 *
 * @param stickers 更新対象のステッカー
 * @param parsedMove 適用するパース済み手
 */
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

/**
 * ベクトルを指定軸の周りに90度単位で回転する。
 *
 * @param vector 回転するベクトル
 * @param axis 回転軸
 * @param quarterTurns 90度単位の回転量
 * @returns 回転後の新しいベクトル
 */
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

/** @returns 3次元ステッカーを面ごとの3行3列へ変換した状態 */
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

/**
 * 法線ベクトルに対応する面を返す。
 *
 * @param normal 判定する法線
 * @returns 法線が向いている面
 * @throws 6面のどれにも一致しない場合
 */
function faceForNormal(normal: Vector): CubeFace {
  const entry = (Object.entries(FACE_NORMALS) as Array<[CubeFace, Vector]>).find(([, candidate]) =>
    candidate.every((value, index) => value === normal[index]),
  );
  if (!entry) throw new Error(`Invalid sticker normal: ${normal.join(',')}`);
  return entry[0];
}

/**
 * 3次元位置を指定面内の行列位置へ変換する。
 *
 * @param face 変換対象の面
 * @param position ステッカーの3次元位置
 * @returns 面内の行と列
 */
function faceCoordinates(face: CubeFace, [x, y, z]: Vector): [number, number] {
  if (face === 'U') return [z + 1, x + 1];
  if (face === 'D') return [1 - z, x + 1];
  if (face === 'F') return [1 - y, x + 1];
  if (face === 'B') return [1 - y, 1 - x];
  if (face === 'R') return [1 - y, 1 - z];
  return [1 - y, z + 1];
}

/**
 * 3行3列の面を展開図の指定位置へコピーする。
 *
 * @param net 更新対象の展開図
 * @param face コピーする面
 * @param startRow コピー先の開始行
 * @param startColumn コピー先の開始列
 */
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
