import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { SolveCategory } from '../../core/cube.models';
import {
  topLayerOrientationPatternFromScramble,
  topLayerPatternFromScramble,
} from '../../core/cube-state';
import { CubeNetView } from '../cube-net/cube-net';
import { CubePatternView } from '../cube-pattern/cube-pattern';

/** solveカテゴリーに応じて6面展開図または上段認識パターンを表示する。 */
@Component({
  selector: 'app-solve-pattern',
  imports: [CubeNetView, CubePatternView],
  templateUrl: './solve-pattern.html',
  styleUrl: './solve-pattern.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolvePattern {
  /** 表示方式を決めるsolveカテゴリー。 */
  readonly category = input.required<SolveCategory>();
  /** 表示するキューブ状態を作るスクランブル。 */
  readonly scramble = input.required<string>();

  /** 支援技術へパターンの内容を伝えるラベル。 */
  protected readonly label = translateSignal(
    'timer.solvePattern',
    computed(() => ({ scramble: this.scramble() })),
  );

  /** OLLは黄色方向、PLLはステッカー色を含めた上段パターンへ変換する。 */
  protected readonly pattern = computed(() =>
    this.category() === 'oll'
      ? topLayerOrientationPatternFromScramble(this.scramble())
      : topLayerPatternFromScramble(this.scramble()),
  );
}
