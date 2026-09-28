import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlgorithmChoice } from '../algorithm-choice/algorithm-choice';

/** F2L・OLL・PLLの説明と各画面への入口を表示する。 */
@Component({
  selector: 'app-algorithm-selection',
  imports: [AlgorithmChoice],
  template: `<section>
    @for (kind of kinds; track kind) {
      <app-algorithm-choice [kind]="kind" />
    }
  </section>`,
  styleUrl: './algorithm-selection.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmSelection {
  /** 学習する順に並べたアルゴリズム種別。 */
  protected readonly kinds = ['f2l', 'oll', 'pll'] as const;
}
