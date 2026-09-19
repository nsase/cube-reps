import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { F2lAlgorithmCase } from '../../../../core/cube/cube.models';

/** F2Lの1ケースと仮のSolve・Setupを表示するカード。 */
@Component({
  selector: 'app-f2l-case-card',
  imports: [TranslocoPipe],
  templateUrl: './f2l-case-card.html',
  styleUrl: './f2l-case-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class F2lCaseCard {
  /** このカードに表示するケース。 */
  readonly item = input.required<F2lAlgorithmCase>();
}
