import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** 各アルゴリズム画面に共通の種別切り替えを表示する。 */
@Component({
  selector: 'app-algorithm-kind-links',
  imports: [RouterLink, RouterLinkActive, MatButtonToggleModule, TranslocoPipe],
  templateUrl: './algorithm-kind-links.html',
  styleUrl: './algorithm-kind-links.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmKindLinks {}
