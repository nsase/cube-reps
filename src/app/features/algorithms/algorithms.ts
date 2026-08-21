import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { OLL_CASES, PLL_CASES } from '../../core/algorithm-cases';
import { AlgorithmCaseCard } from './algorithm-case-card/algorithm-case-card';
import { AlgorithmTools } from './algorithm-tools/algorithm-tools';
import { TranslocoPipe } from '@jsverse/transloco';

/** OLL/PLLケースの検索、手順登録、お気に入りを扱う画面。 */
@Component({
  selector: 'app-algorithms',
  imports: [AlgorithmTools, AlgorithmCaseCard, TranslocoPipe],
  templateUrl: './algorithms.html',
  styleUrl: './algorithms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Algorithms {
  /** ルートデータからOLL/PLL種別を取得する現在のルート。 */
  private readonly route = inject(ActivatedRoute);
  /** ルートデータをSignalとして公開する。 */
  private readonly routeData = toSignal(this.route.data);

  /** ルートデータから算出した現在表示中のケース種別。 */
  protected readonly kind = computed<'OLL' | 'PLL'>(() =>
    this.routeData()?.['kind'] === 'OLL' ? 'OLL' : 'PLL',
  );
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
