import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslocoPipe } from '@jsverse/transloco';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { SolvePattern } from '../../../../shared/solve-pattern/solve-pattern';
import { SolveActions } from '../solve-actions/solve-actions';

/** 計測記録のスクランブル、展開図、付帯情報を表示する詳細ダイアログ。 */
@Component({
  selector: 'app-solve-detail-dialog',
  imports: [DatePipe, MatButtonModule, MatDialogModule, SolveActions, SolvePattern, TranslocoPipe],
  templateUrl: './solve-detail-dialog.html',
  styleUrl: './solve-detail-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveDetailDialog {
  /** ダイアログで表示する計測記録。 */
  protected readonly solve = inject<Solve>(MAT_DIALOG_DATA);
  /** タイムと記録グループの表示形式を提供するサービス。 */
  protected readonly cube = inject(CubeService);
  /**
   * ペナルティ操作後も最新状態を表示する計測記録。
   * ダイアログを開いた後の変更を反映するため、保存中の同一ID記録を優先して参照する。
   */
  protected readonly currentSolve = computed(
    () => this.cube.solves().find(({ id }) => id === this.solve.id) ?? this.solve,
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
