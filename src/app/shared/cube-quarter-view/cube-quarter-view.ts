import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CubeQuarterPattern } from '../../core/cube/cube-state';

/** 投影平面の2次元座標。 */
type Point = readonly [number, number];

/** 各面の左上・右上・左下。共通の辺を共有する平行四辺形として投影する。 */
const FACE_CORNERS: Readonly<Record<keyof CubeQuarterPattern, readonly [Point, Point, Point]>> = {
  U: [
    [64, 12],
    [148, 36],
    [12, 42],
  ],
  F: [
    [12, 42],
    [96, 66],
    [12, 120],
  ],
  R: [
    [96, 66],
    [148, 36],
    [96, 144],
  ],
};

/** 上面・前面・右面の全段をSVGで描画するクォータービュー。 */
@Component({
  selector: 'app-cube-quarter-view',
  templateUrl: './cube-quarter-view.html',
  styleUrl: './cube-quarter-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()' },
})
export class CubeQuarterView {
  /** 各面を外側から見て行優先に並べた3×3ステッカー。 */
  readonly pattern = input.required<CubeQuarterPattern>();
  /** 支援技術へ図の対象と観察方向を伝える翻訳済みラベル。 */
  readonly label = input.required<string>();

  /** 各ステッカーの位置と色を、SVGの多角形へ変換する。 */
  protected readonly faces = computed(() =>
    (['U', 'F', 'R'] as const).map((face) => ({
      name: face,
      stickers: this.pattern()[face].flatMap((colors, row) =>
        colors.map((color, column) => ({
          row,
          column,
          color,
          points: [
            this.project(face, column, row),
            this.project(face, column + 1, row),
            this.project(face, column + 1, row + 1),
            this.project(face, column, row + 1),
          ]
            .map(([x, y]) => `${x},${y}`)
            .join(' '),
        })),
      ),
    })),
  );

  /**
   * 面内のグリッド交点を、3面の接合する投影平面へ移す。
   * @param face 描画対象の面
   * @param column 左端からの交点番号（0〜3）
   * @param row 上端からの交点番号（0〜3）
   * @returns SVG座標
   */
  private project(face: keyof CubeQuarterPattern, column: number, row: number): Point {
    const [origin, right, down] = FACE_CORNERS[face];
    return [
      origin[0] + ((right[0] - origin[0]) * column) / 3 + ((down[0] - origin[0]) * row) / 3,
      origin[1] + ((right[1] - origin[1]) * column) / 3 + ((down[1] - origin[1]) * row) / 3,
    ];
  }
}
