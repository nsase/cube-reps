import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CubeQuarterPattern } from '../../core/cube/cube-state';

import { projectCubePoint } from './cube-quarter-projection';

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
            projectCubePoint(face, column, row),
            projectCubePoint(face, column + 1, row),
            projectCubePoint(face, column + 1, row + 1),
            projectCubePoint(face, column, row + 1),
          ]
            .map(([x, y]) => `${x},${y}`)
            .join(' '),
        })),
      ),
    })),
  );
}
