import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** 練習画面への導線と下部の設定リンクを表示するナビゲーション。 */
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav {}
