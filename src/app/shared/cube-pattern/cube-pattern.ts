import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CubePattern, StickerColor } from '../../core/cube.models';

interface PatternCell {
  color: StickerColor;
  x: number;
  y: number;
  region: 'face' | 'back' | 'front' | 'left' | 'right' | 'corner-void';
}

@Component({
  selector: 'app-cube-pattern',
  templateUrl: './cube-pattern.html',
  styleUrl: './cube-pattern.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()' },
})
export class CubePatternView {
  readonly pattern = input.required<CubePattern>();
  readonly label = input('キューブパターン');
  protected readonly cells = computed<PatternCell[]>(() =>
    this.pattern().flatMap((row, y) =>
      row.map((color, x) => ({ color, x, y, region: this.regionAt(x, y) })),
    ),
  );

  private regionAt(x: number, y: number): PatternCell['region'] {
    if ((x === 0 || x === 4) && (y === 0 || y === 4)) return 'corner-void';
    if (y === 0) return 'back';
    if (y === 4) return 'front';
    if (x === 0) return 'left';
    if (x === 4) return 'right';
    return 'face';
  }
}
