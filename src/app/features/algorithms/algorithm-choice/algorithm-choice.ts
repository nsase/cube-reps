import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** 選択画面で一種類のアルゴリズムの説明と移動先を表示する。 */
@Component({
  selector: 'app-algorithm-choice',
  imports: [RouterLink, TranslocoPipe],
  template: `<a [routerLink]="'/algorithms/' + kind()"
    ><h2>{{ kind().toUpperCase() }}</h2>
    <p>{{ 'algorithms.selection.' + kind() | transloco }}</p></a
  >`,
  styleUrl: './algorithm-choice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmChoice {
  /** 遷移先と説明に使うアルゴリズム種別。 */
  readonly kind = input.required<'f2l' | 'oll' | 'pll'>();
}
