import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OLL_CASES, PLL_CASES } from '../../core/algorithm-cases';
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
  protected readonly kind = signal<'OLL' | 'PLL'>('PLL');
  protected readonly query = signal('');
  protected readonly copied = signal('');
  protected readonly cases = computed(() => {
    const query = this.query().trim().toLowerCase();
    return [...OLL_CASES, ...PLL_CASES].filter(
      (item) =>
        item.kind === this.kind() &&
        `${item.name} ${item.number} ${item.group}`.toLowerCase().includes(query),
    );
  });

  protected async copy(item: AlgorithmCase): Promise<void> {
    if (item.algorithm.includes('登録予定')) return;
    await navigator.clipboard?.writeText(item.algorithm);
    this.copied.set(item.kind + item.number);
    window.setTimeout(() => this.copied.set(''), 1000);
  }
}
