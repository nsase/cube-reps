import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AlgorithmCase } from '../../../core/cube.models';
import { CubePatternView } from '../../../shared/cube-pattern/cube-pattern';
import { AlgorithmPanel } from './algorithm-panel/algorithm-panel';
import { TranslocoPipe } from '@jsverse/transloco';

/** 1件のOLL/PLLケースと、その手順一覧・編集操作を表示するコンポーネント。 */
@Component({
  selector: 'app-algorithm-case-card',
  imports: [CubePatternView, AlgorithmPanel, TranslocoPipe],
  templateUrl: './algorithm-case-card.html',
  styleUrl: './algorithm-case-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCaseCard {
  /** 表示するOLLまたはPLLケース。 */
  readonly item = input.required<AlgorithmCase>();
}
