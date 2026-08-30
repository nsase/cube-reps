import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CubeService } from '../../../core/cube';
import { HistoryStore } from '../history.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { average, mean } from '../../../core/cube-statistics';

/** 履歴の絞り込み対象となる記録の集計値を表示するコンポーネント。 */
@Component({
  selector: 'app-history-summary',
  imports: [TranslocoPipe],
  templateUrl: './history-summary.html',
  styleUrl: './history-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorySummary {
  /** グループ一覧と時間整形を提供するサービス。 */
  protected readonly cube = inject(CubeService);
  /** Historyコンポーネントツリー内で共有する画面状態。 */
  protected readonly store = inject(HistoryStore);

  /** 対象記録内のベストタイム。記録がない場合は`Infinity`。 */
  protected readonly best = computed(() =>
    Math.min(
      ...this.store
        .filteredSolves()
        .filter((solve) => solve.penalty !== 'DNF')
        .map((solve) => this.cube.finalTime(solve)),
      Infinity,
    ),
  );
  /** 対象となる全記録のMean。 */
  protected readonly mean = computed(() => mean(this.validTimes()));
  /** 対象となる最新5件のAverage。 */
  protected readonly ao5 = computed(() => this.averageOf(5));
  /** 対象となる最新12件のAverage。 */
  protected readonly ao12 = computed(() => this.averageOf(12));
  /** 対象となる最新50件のAverage。 */
  protected readonly ao50 = computed(() => this.averageOf(50));
  /** 対象となる最新100件のAverage。 */
  protected readonly ao100 = computed(() => this.averageOf(100));

  /** 集計結果を未計測・DNF・タイムのいずれかで表示する。 */
  protected formatStatistic(value: number | undefined): string {
    if (value === undefined) return '—';
    return value === Infinity ? 'DNF' : this.cube.formatTime(value);
  }

  /** @returns 絞り込み対象の記録をDNF込みの集計値へ変換した配列 */
  private statTimes(): number[] {
    return this.store.filteredSolves().map((solve) => this.cube.statTime(solve));
  }

  /** @returns 絞り込み対象からDNFを除外し、+2を反映したタイム配列 */
  private validTimes(): number[] {
    return this.store
      .filteredSolves()
      .filter((solve) => solve.penalty !== 'DNF')
      .map((solve) => this.cube.finalTime(solve));
  }

  /** 指定件数が揃っている場合に最新記録のAverageを返す。 */
  private averageOf(count: number): number | undefined {
    const times = this.statTimes();
    return times.length < count ? undefined : average(times.slice(0, count));
  }
}
