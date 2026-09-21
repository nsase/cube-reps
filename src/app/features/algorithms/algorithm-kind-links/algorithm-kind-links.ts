import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
  /** 種別選択を画面遷移へ反映するルーター。 */
  private readonly router = inject(Router);
  /** 直接アクセスや履歴移動でも選択中の種別をURLと一致させる。 */
  protected readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
      startWith(this.router.url.split(/[?#]/)[0]),
    ),
  );

  /** クリックとキーボードのどちらによる選択でも対象の手順画面へ移動する。 */
  protected navigate(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
