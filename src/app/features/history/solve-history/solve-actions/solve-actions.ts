import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CubeService } from '../../../../core/cube';
import { Solve } from '../../../../core/cube.models';
import { ConfirmService } from '../../../../shared/confirm-dialog/confirm.service';

/** 履歴の計測記録に対するペナルティ、リトライ、削除操作を表示する。 */
@Component({
  selector: 'app-solve-actions',
  imports: [MatButtonModule, MatIconModule, TranslocoPipe],
  host: { '[class.detailed]': 'detailed()' },
  templateUrl: './solve-actions.html',
  styleUrl: './solve-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveActions {
  /** 操作する計測記録。 */
  readonly solve = input.required<Solve>();
  /** retryと削除をアイコンだけでなくテキスト付きで表示するか。 */
  readonly detailed = input(false);
  /** 記録を削除したことを呼び出し元へ通知する。 */
  readonly deleted = output<void>();
  /** リトライのためタイマーへ移動することを呼び出し元へ通知する。 */
  readonly retried = output<void>();

  /** 計測記録の更新とリトライ指定を行うサービス。 */
  protected readonly cube = inject(CubeService);
  /**
   * ペナルティ変更後も最新状態を表示する操作対象。
   * 詳細ダイアログの入力は固定されるため、保存中の同一ID記録を優先して参照する。
   */
  protected readonly currentSolve = computed(
    () => this.cube.solves().find(({ id }) => id === this.solve().id) ?? this.solve(),
  );
  /** 記録削除の確認を表示するサービス。 */
  private readonly confirm = inject(ConfirmService);
  /** 確認メッセージを現在の言語へ翻訳するサービス。 */
  private readonly i18n = inject(TranslocoService);
  /** リトライ時にタイマー画面へ移動するルーター。 */
  private readonly router = inject(Router);

  /**
   * 確認後にこの計測記録を削除する。
   * 詳細ダイアログなどの呼び出し元が表示を閉じられるように、削除完了を通知する。
   */
  protected delete(): void {
    this.confirm
      .delete(
        this.i18n.translate('history.deleteSolveTitle'),
        this.i18n.translate('history.deleteSolveMessage'),
      )
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.cube.removeSolve(this.currentSolve().id);
        this.deleted.emit();
      });
  }

  /**
   * この記録と同じ条件で再計測できるようにして、タイマー画面へ移動する。
   * 詳細ダイアログなどの呼び出し元が表示を閉じられるように、遷移前にリトライ開始を通知する。
   */
  protected retry(): void {
    this.cube.prepareRetry(this.currentSolve());
    this.retried.emit();
    void this.router.navigate(['/timer']);
  }
}
