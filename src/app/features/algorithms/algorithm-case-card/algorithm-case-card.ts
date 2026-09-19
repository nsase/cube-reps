import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  topLayerOrientationPatternFromScramble,
  topLayerPatternFromScramble,
} from '../../../core/cube/cube-state';
import { AlgorithmCase } from '../../../core/cube/cube.models';
import { CubePatternView } from '../../../shared/cube-pattern/cube-pattern';
import { AlgorithmPanel } from './algorithm-panel/algorithm-panel';

/** 1件のF2L・OLL・PLLケースと、その手順一覧・編集操作を表示するコンポーネント。 */
@Component({
  selector: 'app-algorithm-case-card',
  imports: [MatCardModule, CubePatternView, AlgorithmPanel, TranslocoPipe],
  templateUrl: './algorithm-case-card.html',
  styleUrl: './algorithm-case-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCaseCard {
  /** 表示するF2L・OLL・PLLケース。 */
  readonly item = input.required<AlgorithmCase>();

  /** SetupからOLLは黄色方向、PLL・F2Lは側面色を含む上面図を生成する。F2LはダミーSetupによる仮表示。 */
  protected readonly pattern = computed(() => {
    const item = this.item();
    return item.kind === 'OLL'
      ? topLayerOrientationPatternFromScramble(item.setup)
      : topLayerPatternFromScramble(item.setup);
  });
}
