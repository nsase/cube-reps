import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoService } from '@jsverse/transloco';
import { Solve } from '../../core/cube.models';
import { SolveOwnerService } from '../../core/solve-owner';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

/** 1件の所有者を同じ大きさの画像・イニシャル・アイコンで表示する。 */
@Component({
  selector: 'app-owner-avatar',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './owner-avatar.html',
  styleUrl: './owner-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnerAvatar {
  /** 所有者を表示する記録。 */
  readonly solve = input.required<Solve>();
  /** 画像読み込みに失敗したURL。別の画像へ変われば再び読み込む。 */
  protected readonly failedPhoto = signal<string | undefined>(undefined);
  /** 台帳から取得する表示情報。 */
  protected readonly owners = inject(SolveOwnerService);
  /** タップで表示する所有者詳細のダイアログ。 */
  private readonly dialog = inject(MatDialog);
  /** 操作時点の翻訳。 */
  private readonly i18n = inject(TranslocoService);

  /** タッチ端末でも所有者の詳細を確認できるようにする。 */
  protected showDetails(): void {
    this.dialog.open(ConfirmDialog, {
      data: {
        title: this.i18n.translate('ownership.owner'),
        message: this.owners.details(this.solve()),
        buttons: [{ id: 'close', labelKey: 'common.close' }],
        defaultFocus: 'close',
      },
    });
  }
}
