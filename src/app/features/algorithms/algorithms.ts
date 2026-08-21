import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OLL_CASES, PLL_CASES } from '../../core/algorithm-cases';
import { AlgorithmLibraryService, CaseAlgorithm } from '../../core/algorithm-library';
import { AlgorithmCase } from '../../core/cube.models';
import { DialogButtons } from '../../shared/confirm-dialog/confirm-dialog.buttons';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../shared/confirm-dialog/confirm-dialog.models';
import { CubePatternView } from '../../shared/cube-pattern/cube-pattern';

/** OLL/PLLケースの検索、手順登録、お気に入りを扱う画面。 */
@Component({
  selector: 'app-algorithms',
  imports: [FormsModule, MatButtonModule, MatIconModule, CubePatternView],
  templateUrl: './algorithms.html',
  styleUrl: './algorithms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Algorithms {
  /** ケースごとの表示手順とユーザー設定を管理するサービス。 */
  protected readonly library = inject(AlgorithmLibraryService);
  /** 手順削除の確認を表示するMaterial Dialogサービス。 */
  private readonly dialog = inject(MatDialog);

  /** 現在表示しているケース種別。 */
  protected readonly kind = signal<'OLL' | 'PLL'>('PLL');
  /** ケース一覧の検索文字列。 */
  protected readonly query = signal('');
  /** コピー完了表示中の手順キー。 */
  protected readonly copied = signal('');
  /** ケースキーごとの未登録手順入力値。 */
  protected readonly drafts = signal<Record<string, string>>({});
  /** 種別と検索文字列で絞り込んだケース一覧。 */
  protected readonly cases = computed(() => {
    const query = this.query().trim().toLowerCase();
    return [...OLL_CASES, ...PLL_CASES].filter(
      (item) =>
        item.kind === this.kind() &&
        `${item.name} ${item.aliases?.join(' ') ?? ''} ${item.number} ${item.group}`
          .toLowerCase()
          .includes(query),
    );
  });

  /** @returns 指定ケースの入力中手順 */
  protected draftFor(item: AlgorithmCase): string {
    return this.drafts()[this.library.caseKey(item)] ?? '';
  }
  /** 指定ケースの入力中手順を更新する。 */
  protected setDraft(item: AlgorithmCase, value: string): void {
    this.drafts.update((drafts) => ({ ...drafts, [this.library.caseKey(item)]: value }));
  }
  /** @returns 手順一覧内での表示順位。見つからない場合は`-1` */
  protected favoriteRank(item: AlgorithmCase, algorithm: CaseAlgorithm): number {
    return this.library.algorithmsFor(item).findIndex((candidate) => candidate.id === algorithm.id);
  }
  /** 入力中の手順を指定ケースへ追加し、成功時に入力を空にする。 */
  protected add(item: AlgorithmCase): void {
    if (!this.library.add(item, this.draftFor(item))) return;
    this.setDraft(item, '');
  }
  /**
   * 手順をクリップボードへコピーし、1秒間だけ完了状態を表示する。
   *
   * @param item 対象ケース
   * @param algorithm コピーする手順
   */
  protected async copy(item: AlgorithmCase, algorithm: CaseAlgorithm): Promise<void> {
    await navigator.clipboard?.writeText(algorithm.notation);
    this.copied.set(`${this.library.caseKey(item)}-${algorithm.id}`);
    window.setTimeout(() => this.copied.set(''), 1000);
  }

  /** 確認後にユーザー登録手順を削除する。 */
  protected remove(item: AlgorithmCase, algorithm: CaseAlgorithm): void {
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
