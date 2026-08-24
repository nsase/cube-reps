import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { SolvePattern } from '../../../../shared/solve-pattern/solve-pattern';
import { SolveActions } from '../solve-actions/solve-actions';

/** 計測記録のスクランブル、展開図、付帯情報を表示する詳細ダイアログ。 */
@Component({
  selector: 'app-solve-detail-dialog',
  imports: [MatButtonModule, MatDialogModule, SolveActions, SolvePattern, TranslocoPipe],
  templateUrl: './solve-detail-dialog.html',
  styleUrl: './solve-detail-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveDetailDialog {
  /** ダイアログで表示する計測記録。 */
  protected readonly solve = inject<Solve>(MAT_DIALOG_DATA);
  /** タイムと記録グループの表示形式を提供するサービス。 */
  protected readonly cube = inject(CubeService);
  /** 表示中の言語と変更通知を提供するサービス。 */
  private readonly i18n = inject(TranslocoService);
  /** 詳細表示を開いたまま切り替えられる現在の言語。 */
  private readonly activeLang = toSignal(this.i18n.langChanges$, {
    initialValue: this.i18n.getActiveLang(),
  });
  /**
   * ペナルティ操作後も最新状態を表示する計測記録。
   * ダイアログを開いた後の変更を反映するため、保存中の同一ID記録を優先して参照する。
   */
  protected readonly currentSolve = computed(
    () => this.cube.solves().find(({ id }) => id === this.solve.id) ?? this.solve,
  );
  /**
   * 現在の表示言語に合わせた計測日時。
   * Angularの固定LOCALE_IDに依存せず、言語切替を詳細表示へ即時反映する。
   */
  protected readonly formattedDate = computed(() =>
    new Intl.DateTimeFormat(this.activeLang(), {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(this.currentSolve().date)),
  );
  /** 操作完了後にこの詳細表示を閉じるダイアログ参照。 */
  private readonly dialogRef = inject(MatDialogRef<SolveDetailDialog>);

  /**
   * 操作対象が削除またはリトライされた後に詳細表示を閉じる。
   * 変更前の記録をダイアログへ残さないようにする。
   */
  protected close(): void {
    this.dialogRef.close();
  }
}
