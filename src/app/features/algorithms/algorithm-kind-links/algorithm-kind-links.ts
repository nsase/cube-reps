import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';

/** 各アルゴリズム画面に共通の種別切り替えを表示する。 */
@Component({
  selector: 'app-algorithm-kind-links',
  imports: [MatButtonToggleModule, TranslocoPipe],
  templateUrl: './algorithm-kind-links.html',
  styleUrl: './algorithm-kind-links.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmKindLinks {
  /** 種別の選択とブラウザ履歴の移動を同じルートへ同期する。 */
  private readonly router = inject(Router);

  /** 画面遷移が完了したURLを選択表示へ反映する。 */
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] },
  );

  /** ポインター・キーボード共通の選択イベントから種別画面へ移動する。 */
  protected navigate(kind: string): void {
    void this.router.navigate(['/algorithms', kind]);
  }
}
