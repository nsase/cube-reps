import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** 各アルゴリズム画面に共通の種別切り替えを表示する。 */
@Component({
  selector: 'app-algorithm-kind-links',
  imports: [RouterLink, RouterLinkActive, MatButtonToggleModule, TranslocoPipe],
  templateUrl: './algorithm-kind-links.html',
  styleUrl: './algorithm-kind-links.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmKindLinks {
  /** 種別の選択とブラウザ履歴の移動を同じルートへ同期する。 */
  private readonly router = inject(Router);

  /** 選択した種別へ移動する。Materialの矢印キー操作はclickを発火しないため、changeでも遷移を通知する。 */
  protected navigate(kind: string): void {
    void this.router.navigate(['/algorithms', kind]);
  }
}
