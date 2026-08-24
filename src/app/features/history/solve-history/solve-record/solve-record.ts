import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { ConfirmService } from '../../../../shared/confirm-dialog/confirm.service';
import { Router } from '@angular/router';
import { SolveDetailDialog } from '../solve-detail-dialog/solve-detail-dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** 1件の計測記録と、そのペナルティ・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-solve-record',
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslocoPipe],
  templateUrl: './solve-record.html',
  styleUrl: './solve-record.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveRecord {
  /** 表示する計測記録。 */
  readonly solve = input.required<Solve>();
  /** 履歴一覧に表示する通し番号。 */
  readonly recordNumber = input.required<number>();
  /** この記録を末尾とするAo5。 */
  readonly ao5 = input<number>();
  /** この記録を末尾とするAo12。 */
  readonly ao12 = input<number>();

  /** 計測記録の表示と更新を行うサービス。 */
  protected readonly cube = inject(CubeService);
  /** 記録削除の確認を表示するサービス。 */
  private readonly confirm = inject(ConfirmService);
  /** 確認メッセージを現在の言語へ翻訳するサービス。 */
  private readonly i18n = inject(TranslocoService);
  /** リトライ時にタイマー画面へ移動するルーター。 */
  private readonly router = inject(Router);

  /** 記録の低優先度情報を詳細表示するダイアログサービス。 */
  private readonly dialog = inject(MatDialog);
  /** 確認後にこの計測記録を削除する。 */
  protected delete(): void {
    this.confirm
      .delete(
        this.i18n.translate('history.deleteSolveTitle'),
        this.i18n.translate('history.deleteSolveMessage'),
      )
      .subscribe((confirmed) => {
        if (confirmed) this.cube.removeSolve(this.solve().id);
      });
  }

  /**
   * この記録と同じスクランブルで再計測できるようにして、タイマー画面へ移動する。
   * 画面遷移後に元記録のカテゴリーと記録グループも引き継ぐ。
   */
  protected retry(): void {
    this.cube.prepareRetry(this.solve());
    void this.router.navigate(['/timer']);
  }

  /**
   * スクランブルや展開図を含む、この記録の詳細を表示する。
   * 一覧の情報量を抑えながら、必要な情報へアクセスできるようにダイアログへ分離する。
   */
  protected showDetails(): void {
    this.dialog.open(SolveDetailDialog, { data: this.solve() });
  }

  /**
   * その時点のAverageを一覧表示用に整形する。
   *
   * @param value Average。必要件数が揃っていない場合は`undefined`
   * @returns タイム、DNF、未集計記号のいずれか
   */
  protected formatAverage(value: number | undefined): string {
    if (value === undefined) return '—';
    return value === Infinity ? 'DNF' : this.cube.formatTime(value);
  }
}
