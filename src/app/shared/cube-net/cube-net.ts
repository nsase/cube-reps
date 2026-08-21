import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CubeFace, CubeOrientation, cubeFacesFromScramble } from '../../core/cube-state';
import { StickerColor } from '../../core/cube.models';

/** 展開図に描画する1面分のデータ。 */
interface NetFace {
  /** 面を識別する記号。 */
  name: CubeFace;
  /** 左上から行優先で並べた9枚のステッカー。 */
  stickers: StickerColor[];
}

/** スクランブル適用後のキューブを展開図として描画するコンポーネント。 */
@Component({
  selector: 'app-cube-net',
  templateUrl: './cube-net.html',
  styleUrl: './cube-net.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()' },
})
export class CubeNetView {
  /** 展開図へ適用するスクランブル。 */
  readonly scramble = input.required<string>();
  /** 展開図を観察する向き。 */
  readonly orientation = input<CubeOrientation>('white-top');

  /** 支援技術へ展開図の内容を伝えるラベル。 */
  protected readonly label = computed(() => `スクランブルの展開図: ${this.scramble()}`);

  /** テンプレートの描画順に変換した6面分のステッカー。 */
  protected readonly faces = computed<NetFace[]>(() => {
    const faces = cubeFacesFromScramble(this.scramble(), this.orientation());
    return (['U', 'L', 'F', 'R', 'B', 'D'] as const).map((name) => ({
      name,
      stickers: faces[name].flat(),
    }));
  });
}
