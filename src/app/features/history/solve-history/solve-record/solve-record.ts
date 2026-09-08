import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { OwnerAvatar } from '../../../../shared/owner-avatar/owner-avatar';
import { SolveActions } from '../solve-actions/solve-actions';
import { SolveDetailDialog } from '../solve-detail-dialog/solve-detail-dialog';

/** 1件の計測記録と、そのペナルティ・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-solve-record',
  imports: [
    OwnerAvatar,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    SolveActions,
    TranslocoPipe,
  ],
  templateUrl: './solve-record.html',
  styleUrl: './solve-record.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveRecord {
  /** 親の履歴スコープで判定した選択可否。 */
  readonly selectable = input(false);
  /** 親の履歴スコープで保持する選択状態。 */
  readonly selected = input(false);
  /** 親の選択集合を更新する操作。 */
  readonly selectionChanged = output<void>();
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
  /** 表示中の言語と変更通知を提供するサービス。 */
  private readonly i18n = inject(TranslocoService);
  /** 一覧を表示したまま切り替えられる現在の言語。 */
  private readonly activeLang = toSignal(this.i18n.langChanges$, {
    initialValue: this.i18n.getActiveLang(),
  });
  /**
   * 年を省略し、現在の表示言語に合わせて短く整形した計測日時。
   * 英語では月名を使い、月と日の順序を誤解しない表記にする。
   */
  protected readonly formattedDate = computed(() => {
    const locale = this.activeLang() === 'ja' ? 'ja-JP' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      month: locale === 'ja-JP' ? '2-digit' : 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(this.solve().createdAt));
  });
  /** 記録の低優先度情報を詳細表示するダイアログサービス。 */
  private readonly dialog = inject(MatDialog);

  /**
   * スクランブルや展開図を含む、この記録の詳細を表示する。
   * 一覧の情報量を抑えながら、必要な情報へアクセスできるようにダイアログへ分離する。
   */
  protected showDetails(): void {
    this.dialog.open(SolveDetailDialog, {
      data: { solve: this.solve(), recordNumber: this.recordNumber() },
    });
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
