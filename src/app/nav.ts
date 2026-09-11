import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** 共通レイアウトとルーターOutletを表示するルートコンポーネント。 */
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav {}
