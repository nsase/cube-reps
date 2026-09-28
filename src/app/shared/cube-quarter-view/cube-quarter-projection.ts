import { CubeQuarterPattern } from '../../core/cube/cube-state';

/** SVG上の投影座標。 */
export type ProjectedPoint = readonly [number, number];

/** 正面を広めに見せ、上面も認識できるカメラの水平方向と仰角。 */
const YAW = (35 * Math.PI) / 180;
const PITCH = (25 * Math.PI) / 180;
/** 弱い遠近感を付ける視点距離と、既存viewBoxに収まる投影倍率。 */
const CAMERA_DISTANCE = 8;
const FOCAL_LENGTH = 325;

/**
 * 面内の交点を立方体上の3次元座標へ戻し、同一カメラで透視投影する。
 * 手前の辺を奥より大きく見せつつ、3面が共有する辺に隙間ができるのを防ぐ。
 * @param face 描画する面
 * @param column 面内の列の交点番号（0〜3）
 * @param row 面内の行の交点番号（0〜3）
 * @returns 160×156のviewBox内のSVG座標
 */
export function projectCubePoint(
  face: keyof CubeQuarterPattern,
  column: number,
  row: number,
): ProjectedPoint {
  const across = (column * 2) / 3 - 1;
  const down = (row * 2) / 3 - 1;
  const [x, y, z] =
    face === 'U' ? [across, 1, down] : face === 'F' ? [across, -down, 1] : [1, -down, -across];
  const horizontal = Math.cos(YAW) * x - Math.sin(YAW) * z;
  const vertical =
    -Math.sin(YAW) * Math.sin(PITCH) * x +
    Math.cos(PITCH) * y -
    Math.cos(YAW) * Math.sin(PITCH) * z;
  const depth =
    CAMERA_DISTANCE -
    (Math.sin(YAW) * Math.cos(PITCH) * x +
      Math.sin(PITCH) * y +
      Math.cos(YAW) * Math.cos(PITCH) * z);
  return [80 + (FOCAL_LENGTH * horizontal) / depth, 73 - (FOCAL_LENGTH * vertical) / depth];
}
