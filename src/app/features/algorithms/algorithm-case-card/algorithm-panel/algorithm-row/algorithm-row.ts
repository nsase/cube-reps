import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AlgorithmLibraryService, CaseAlgorithm } from '../../../../../core/algorithm-library';
import { AlgorithmCase } from '../../../../../core/cube.models';
import { ConfirmService } from '../../../../../shared/confirm-dialog/confirm.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** 1件の手順と、お気に入り・コピー・削除操作を表示するコンポーネント。 */
@Component({
  selector: 'app-algorithm-row',
  imports: [MatButtonModule, MatIconModule, TranslocoPipe],
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
  /** 手順削除の確認を表示するサービス。 */
  private readonly confirm = inject(ConfirmService);
  /** 確認メッセージを現在の言語へ翻訳するサービス。 */
  private readonly i18n = inject(TranslocoService);
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
    this.confirm
      .delete(
        this.i18n.translate('algorithms.removeTitle'),
        this.i18n.translate('algorithms.removeMessage', {
          kind: item.kind,
          number: item.number,
          notation: algorithm.notation,
        }),
      )
      .subscribe((confirmed) => {
        if (confirmed) this.library.remove(item, algorithm.id);
      });
  }
}
