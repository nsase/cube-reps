import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AlgorithmLibraryService, CaseAlgorithm } from '../../../../../core/algorithm-library';
import { AlgorithmCase } from '../../../../../core/cube.models';
import { DialogButtons } from '../../../../../shared/confirm-dialog/confirm-dialog.buttons';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../../../shared/confirm-dialog/confirm-dialog.models';

/** 1件の手順と、お気に入り・コピー・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-algorithm-row',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './algorithm-row.html',
  styleUrl: './algorithm-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmRow {
  /** 手順が属するOLLまたはPLLケース。 */
  readonly item = input.required<AlgorithmCase>();
  /** 表示する手順。 */
  readonly algorithm = input.required<CaseAlgorithm>();
  /** 手順一覧内での表示順位。 */
  readonly rank = input.required<number>();

  /** ケースごとの表示手順とユーザー設定を管理するサービス。 */
  protected readonly library = inject(AlgorithmLibraryService);
  /** 手順削除の確認を表示するMaterial Dialogサービス。 */
  private readonly dialog = inject(MatDialog);
  /** コピー完了を表示しているか。 */
  protected readonly copied = signal(false);

  /** 手順をクリップボードへコピーし、1秒間だけ完了状態を表示する。 */
  protected async copy(): Promise<void> {
    await navigator.clipboard?.writeText(this.algorithm().notation);
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1000);
  }

  /** 確認後にこのユーザー登録手順を削除する。 */
  protected remove(): void {
    const item = this.item();
    const algorithm = this.algorithm();
    const data = {
      title: 'ユーザー手順を削除しますか？',
      message: `${item.kind} ${item.number} の手順「${algorithm.notation}」を削除します。\nこの操作は取り消せません。`,
      buttons: [DialogButtons.cancel, DialogButtons.delete],
      defaultFocus: DialogButtons.cancel.id,
    } as const satisfies ConfirmDialogData;

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result === DialogButtons.delete.id) this.library.remove(item, algorithm.id);
      });
  }
}
