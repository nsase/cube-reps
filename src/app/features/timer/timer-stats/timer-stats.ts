import { formatTime } from '../../../core/cube/solve-time';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimerStore } from '../timer.store';
import { TranslocoPipe } from '@jsverse/transloco';

/** 現在の記録グループの集計値と履歴への導線を表示するコンポーネント。 */
@Component({
  selector: 'app-timer-stats',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './timer-stats.html',
  styleUrl: './timer-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerStats {
  /** 共通の時間表示をテンプレートへ提供する。 */
  protected readonly formatTime = formatTime;

  /** Timerのカテゴリーと記録先に応じた画面スコープの集計。 */
  protected readonly store = inject(TimerStore);

  /** 集計結果を未計測・DNF・タイムのいずれかで表示する。 */
  protected formatStatistic(value: number | undefined): string {
    if (value === undefined) return '—';
    return value === Infinity ? 'DNF' : formatTime(value);
  }
}
