import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OLL_CASES, PLL_CASES } from '../../core/algorithm-cases';
import { AlgorithmLibraryService, CaseAlgorithm } from '../../core/algorithm-library';
import { AlgorithmCase } from '../../core/cube.models';
import { CubePatternView } from '../../shared/cube-pattern/cube-pattern';

@Component({
  selector: 'app-algorithms',
  imports: [FormsModule, CubePatternView],
  templateUrl: './algorithms.html',
  styleUrl: './algorithms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Algorithms {
  protected readonly library = inject(AlgorithmLibraryService);
  protected readonly kind = signal<'OLL' | 'PLL'>('PLL');
  protected readonly query = signal('');
  protected readonly copied = signal('');
  protected readonly drafts = signal<Record<string, string>>({});
  protected readonly cases = computed(() => {
    const query = this.query().trim().toLowerCase();
    return [...OLL_CASES, ...PLL_CASES].filter(
      (item) =>
        item.kind === this.kind() &&
        `${item.name} ${item.number} ${item.group}`.toLowerCase().includes(query),
    );
  });

  protected draftFor(item: AlgorithmCase): string {
    return this.drafts()[this.library.caseKey(item)] ?? '';
  }
  protected setDraft(item: AlgorithmCase, value: string): void {
    this.drafts.update((drafts) => ({ ...drafts, [this.library.caseKey(item)]: value }));
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
}
