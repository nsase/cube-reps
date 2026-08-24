import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslocoPipe } from '@jsverse/transloco';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { SolvePattern } from '../../../../shared/solve-pattern/solve-pattern';

/** 計測記録のスクランブル、展開図、付帯情報を表示する詳細ダイアログ。 */
@Component({
  selector: 'app-solve-detail-dialog',
  imports: [DatePipe, MatButtonModule, MatDialogModule, SolvePattern, TranslocoPipe],
  templateUrl: './solve-detail-dialog.html',
  styleUrl: './solve-detail-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveDetailDialog {
  /** ダイアログで表示する計測記録。 */
  protected readonly solve = inject<Solve>(MAT_DIALOG_DATA);
  /** タイムと記録グループの表示形式を提供するサービス。 */
  protected readonly cube = inject(CubeService);
}
