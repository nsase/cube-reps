import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CubePattern, StickerColor } from '../../core/cube.models';

/** OLL/PLLパターン表示を構成する1セル。 */
interface PatternCell {
  /** セルに表示するステッカー色。 */
  color: StickerColor;
  /** パターン内の横位置。 */
  x: number;
  /** パターン内の縦位置。 */
  y: number;
  /** セルが属するキューブ上の領域。 */
  region: 'face' | 'back' | 'front' | 'left' | 'right' | 'corner-void';
}

/** OLL/PLLケースの上面と側面上段を描画するコンポーネント。 */
@Component({
  selector: 'app-cube-pattern',
  templateUrl: './cube-pattern.html',
  styleUrl: './cube-pattern.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()' },
})
export class CubePatternView {
  /** 描画対象の5行5列パターン。 */
  readonly pattern = input.required<CubePattern>();
  /** 支援技術へパターンの内容を伝えるラベル。 */
  readonly label = input('キューブパターン');

  /** テンプレートで描画できる一次元のセル一覧。 */
  protected readonly cells = computed<PatternCell[]>(() =>
    this.pattern().flatMap((row, y) =>
      row.map((color, x) => ({ color, x, y, region: this.regionAt(x, y) })),
    ),
  );

  /**
   * パターン座標をキューブ上の領域へ変換する。
   *
   * @param x パターン内の横位置
   * @param y パターン内の縦位置
   * @returns 座標が属する領域
   */
  private regionAt(x: number, y: number): PatternCell['region'] {
    if ((x === 0 || x === 4) && (y === 0 || y === 4)) return 'corner-void';
    if (y === 0) return 'back';
    if (y === 4) return 'front';
    if (x === 0) return 'left';
    if (x === 4) return 'right';
    return 'face';
  }
}
