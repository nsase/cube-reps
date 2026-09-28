import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** 選択画面で一種類のアルゴリズムの説明と移動先を表示する。 */
@Component({
  selector: 'app-algorithm-choice',
  imports: [MatCardModule, RouterLink, TranslocoPipe],
  template: ` <a [routerLink]="'/algorithms/' + kind()">
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ kind().toUpperCase() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content
        ><p>{{ 'algorithms.selection.' + kind() | transloco }}</p></mat-card-content
      >
    </mat-card>
  </a>`,
  styleUrl: './algorithm-choice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmChoice {
  /** 遷移先と説明に使うアルゴリズム種別。 */
  readonly kind = input.required<'f2l' | 'oll' | 'pll'>();
}
