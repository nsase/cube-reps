import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  f2lQuarterPatternFromScramble,
  topLayerOrientationPatternFromScramble,
  topLayerPatternFromScramble,
} from '../../../core/cube/cube-state';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { f2lCaseForSlot } from '../../../core/algorithm/algorithm-cases/f2l/f2l-case';
import { AlgorithmCase, F2lCase, F2lSlot } from '../../../core/cube/cube.models';
import { CubeQuarterView } from '../../../shared/cube-quarter-view/cube-quarter-view';
import { CubePatternView } from '../../../shared/cube-pattern/cube-pattern';
import { AlgorithmPanel } from './algorithm-panel/algorithm-panel';

/** 1件のF2L・OLL・PLLケースと、その手順一覧・編集操作を表示するコンポーネント。 */
@Component({
  selector: 'app-algorithm-case-card',
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatCardModule,
    CubePatternView,
    CubeQuarterView,
    AlgorithmPanel,
    TranslocoPipe,
  ],
  templateUrl: './algorithm-case-card.html',
  styleUrl: './algorithm-case-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCaseCard {
  /** 表示するF2L・OLL・PLLケース。 */
  readonly item = input.required<AlgorithmCase | F2lCase>();

  /** このカードで表示・編集するスロット。 */
  protected readonly slot = signal<F2lSlot>('FR');
  /** スロット選択肢の表示順。 */
  protected readonly slots = ['FR', 'FL', 'BL', 'BR'] as const;
  /** 4スロットを持つケースに選択操作を表示する。 */
  protected readonly hasSlots = computed(() => 'slots' in this.item());
  /** 選択スロットの手順と保存キーを共通パネルへ渡す。 */
  protected readonly displayItem = computed(() => {
    const item = this.item();
    return 'slots' in item ? f2lCaseForSlot(item, this.slot()) : item;
  });

  /** F2LのSetupから、最終層ピースを灰色にした3面の認識図を生成する。 */
  protected readonly quarterPattern = computed(() =>
    f2lQuarterPatternFromScramble(this.displayItem().setup),
  );

  /** SetupからOLLは黄色方向、PLLは側面色を含む上面図を生成する。 */
  protected readonly pattern = computed(() => {
    const item = this.displayItem();
    return item.kind === 'OLL'
      ? topLayerOrientationPatternFromScramble(item.setup)
      : topLayerPatternFromScramble(item.setup);
  });
}
