import { AlgorithmSyncService } from '../../core/firestore/algorithm-sync.service';
import { AlgorithmTransfer } from './algorithm-transfer/algorithm-transfer';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  untracked,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { F2L_CASES, OLL_CASES, PLL_CASES } from '../../core/algorithm/algorithm-cases';
import { AlgorithmCaseCard } from './algorithm-case-card/algorithm-case-card';
import { AlgorithmTools } from './algorithm-tools/algorithm-tools';

/**
 * F2L・OLL・PLLケースの検索と一覧を提供する画面。
 * 表示範囲に入ったカードから操作部品を生成し、画面切替時の一括描画を避ける。
 */
@Component({
  selector: 'app-algorithms',
  imports: [AlgorithmTransfer, AlgorithmTools, AlgorithmCaseCard, MatCardModule, TranslocoPipe],
  templateUrl: './algorithms.html',
  styleUrl: './algorithms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Algorithms {
  /** ルートデータからF2L・OLL・PLL種別を取得する現在のルート。 */
  private readonly route = inject(ActivatedRoute);
  /** ルートデータをSignalとして公開する。 */
  private readonly routeData = toSignal(this.route.data);

  /** ルートデータから算出した現在表示中のケース種別。 */
  protected readonly kind = computed(() => {
    const kind = this.routeData()?.['kind'];
    return kind === 'F2L' || kind === 'OLL' ? kind : 'PLL';
  });
  /** 種類別の同期境界。 */
  private readonly sync = inject(AlgorithmSyncService);
  /** 同一コンポーネント内の種類切替でも遷移先だけを取得する。 */
  private readonly syncPage = effect((onCleanup) => {
    const kind = this.kind();
    untracked(() => {
      this.sync.activeKind.set(kind);
      void this.sync.refresh(kind);
    });
    onCleanup(() => this.sync.activeKind.set(null));
  });
  /** ケース一覧の検索文字列。 */
  protected readonly query = signal('');

  /** 種別で絞り込んだケース一覧 */
  protected readonly cases = computed(() => {
    const kind = this.kind();
    if (kind === 'F2L') return F2L_CASES;
    if (kind === 'OLL') return OLL_CASES;
    if (kind === 'PLL') return PLL_CASES;
    return [];
  });

  /** 現在の種別で選択できるグループを掲載順に返す。 */
  protected readonly groups = computed(() => [...new Set(this.cases().map((item) => item.group))]);

  /** 種別変更時に解除するグループ条件。 */
  protected readonly group = linkedSignal(() => {
    this.kind();
    return '';
  });

  /** グループの完全一致と検索文字列で絞り込んだケース一覧。 */
  protected readonly filteredCases = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.cases().filter(
      (item) =>
        (!this.group() || item.group === this.group()) &&
        `${item.name} ${item.number} ${item.group}`.toLowerCase().includes(query),
    );
  });
}
