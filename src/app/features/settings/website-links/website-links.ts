import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

/** Web版と開発情報への入口を設定画面に表示する。 */
@Component({
  selector: 'app-website-links',
  imports: [MatButtonModule, MatIconModule, TranslocoPipe],
  templateUrl: './website-links.html',
  styleUrl: './website-links.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsiteLinks {}
