import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { F2L_CASES } from '../../../core/algorithm/algorithm-cases/f2l/f2l-cases';
import { AlgorithmKindLinks } from '../algorithm-kind-links/algorithm-kind-links';
import { F2lCaseCard } from './f2l-case-card/f2l-case-card';

/** F2Lの41ケースを番号順に一覧表示する画面。 */
@Component({
  selector: 'app-f2l',
  imports: [AlgorithmKindLinks, F2lCaseCard, TranslocoPipe],
  templateUrl: './f2l.html',
  styleUrl: './f2l.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class F2l {
  /** 永続IDで追跡するF2Lケース一覧。 */
  protected readonly cases = F2L_CASES;
}
