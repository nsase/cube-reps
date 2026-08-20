import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CubeFace, CubeOrientation, cubeFacesFromScramble } from '../../core/cube-state';
import { StickerColor } from '../../core/cube.models';

interface NetFace {
  name: CubeFace;
  stickers: StickerColor[];
}

@Component({
  selector: 'app-cube-net',
  templateUrl: './cube-net.html',
  styleUrl: './cube-net.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()' },
})
export class CubeNetView {
  readonly scramble = input.required<string>();
  readonly orientation = input<CubeOrientation>('white-top');
  protected readonly label = computed(() => `スクランブルの展開図: ${this.scramble()}`);
  protected readonly faces = computed<NetFace[]>(() => {
    const faces = cubeFacesFromScramble(this.scramble(), this.orientation());
    return (['U', 'L', 'F', 'R', 'B', 'D'] as const).map((name) => ({
      name,
      stickers: faces[name].flat(),
    }));
  });
}
