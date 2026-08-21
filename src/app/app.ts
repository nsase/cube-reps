import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { CubeService } from './core/cube';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** 共通レイアウトとルーターOutletを表示するルートコンポーネント。 */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslocoPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** ヘッダーで計測件数を表示するキューブ状態サービス。 */
  protected readonly cube = inject(CubeService);
  /** 現在のルートとナビゲーションイベントを提供するサービス。 */
  private readonly router = inject(Router);
  /** 翻訳辞書と言語変更を管理するサービス。 */
  protected readonly i18n = inject(TranslocoService);

  /** アクティブな末端ルートのdataに定義された画面見出しの翻訳キー。 */
  protected readonly headingKey = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) route = route.firstChild;
        return (route.data['titleKey'] as string | undefined) ?? '';
      }),
    ),
    { initialValue: '' },
  );

  /** ブラウザに保存された表示言語を起動時に復元する。 */
  constructor() {
    const saved = localStorage.getItem('cube-flow.language');
    const lang = saved === 'ja' || saved === 'en' ? saved : 'en';
    this.i18n.setActiveLang(lang);
    document.documentElement.lang = lang;
  }

  /**
   * 表示言語を切り替えて次回起動時にも復元できるよう保存する。
   *
   * @param lang 切り替える言語コード
   */
  protected setLanguage(lang: 'ja' | 'en'): void {
    this.i18n.setActiveLang(lang);
    localStorage.setItem('cube-flow.language', lang);
    document.documentElement.lang = lang;
  }
}
