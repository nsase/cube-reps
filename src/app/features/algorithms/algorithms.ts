import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { OLL_CASES, PLL_CASES } from '../../core/algorithm-cases';
import { AlgorithmCaseCard } from './algorithm-case-card/algorithm-case-card';
import { AlgorithmTools } from './algorithm-tools/algorithm-tools';

/** OLL/PLLケースの検索、手順登録、お気に入りを扱う画面。 */
@Component({
  selector: 'app-algorithms',
  imports: [AlgorithmTools, AlgorithmCaseCard],
  templateUrl: './algorithms.html',
  styleUrl: './algorithms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Algorithms {
  /** 現在表示しているケース種別。 */
  protected readonly kind = signal<'OLL' | 'PLL'>('PLL');
  /** ケース一覧の検索文字列。 */
  protected readonly query = signal('');
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
}
