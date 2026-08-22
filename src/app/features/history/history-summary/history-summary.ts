import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CubeService } from '../../../core/cube';
import { HistoryStore } from '../history.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { SOLVE_CATEGORIES } from '../../../core/cube.models';

/** 履歴の絞り込み条件と対象記録の集計値を表示するコンポーネント。 */
@Component({
  selector: 'app-history-summary',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './history-summary.html',
  styleUrl: './history-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorySummary {
  /** 履歴で選択できるsolveカテゴリー一覧。 */
  protected readonly solveCategories = SOLVE_CATEGORIES;
  /** グループ一覧と時間整形を提供するサービス。 */
  protected readonly cube = inject(CubeService);
  /** Historyコンポーネントツリー内で共有する画面状態。 */
  protected readonly store = inject(HistoryStore);

  /** 集計対象となるDNF以外の計測記録。 */
  private readonly validSolves = computed(() =>
    this.store.filteredSolves().filter((solve) => solve.penalty !== 'DNF'),
  );

  /** 対象記録内のベストタイム。記録がない場合は`Infinity`。 */
  protected readonly best = computed(() =>
    Math.min(...this.validSolves().map((solve) => this.cube.finalTime(solve)), Infinity),
  );

  /** 対象記録内にある直近5件の有効記録の平均タイム。 */
  protected readonly average = computed(() => {
    const times = this.validSolves()
      .slice(0, 5)
      .map((solve) => this.cube.finalTime(solve));
    return times.length ? times.reduce((total, time) => total + time, 0) / times.length : Infinity;
  });
}
