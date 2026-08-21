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

@Component({
  selector: 'app-algorithms',
  imports: [FormsModule, MatButtonModule, MatIconModule, CubePatternView],
  templateUrl: './algorithms.html',
  styleUrl: './algorithms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Algorithms {
  protected readonly library = inject(AlgorithmLibraryService);
  private readonly dialog = inject(MatDialog);
  protected readonly kind = signal<'OLL' | 'PLL'>('PLL');
  protected readonly query = signal('');
  protected readonly copied = signal('');
  protected readonly drafts = signal<Record<string, string>>({});
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

  protected draftFor(item: AlgorithmCase): string {
    return this.drafts()[this.library.caseKey(item)] ?? '';
  }
  protected setDraft(item: AlgorithmCase, value: string): void {
    this.drafts.update((drafts) => ({ ...drafts, [this.library.caseKey(item)]: value }));
  }
  protected favoriteRank(item: AlgorithmCase, algorithm: CaseAlgorithm): number {
    return this.library.algorithmsFor(item).findIndex((candidate) => candidate.id === algorithm.id);
  }
  protected add(item: AlgorithmCase): void {
    if (!this.library.add(item, this.draftFor(item))) return;
    this.setDraft(item, '');
  }
  protected async copy(item: AlgorithmCase, algorithm: CaseAlgorithm): Promise<void> {
    await navigator.clipboard?.writeText(algorithm.notation);
    this.copied.set(`${this.library.caseKey(item)}-${algorithm.id}`);
    window.setTimeout(() => this.copied.set(''), 1000);
  }

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
