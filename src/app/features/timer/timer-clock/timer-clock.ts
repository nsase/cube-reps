import { formatTime } from '../../../core/cube/solve-time';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TimerStore } from '../timer.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { TimerSolveActions } from '../timer-solve-actions/timer-solve-actions';

/** 経過時間を表示し、ポインターによる計測操作を受け付けるコンポーネント。 */
@Component({
  selector: 'app-timer-clock',
  imports: [TranslocoPipe, TimerSolveActions],
  templateUrl: './timer-clock.html',
  styleUrl: './timer-clock.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerClock {
  /** 共通の時間表示をテンプレートへ提供する。 */
  protected readonly formatTime = formatTime;

  /** Timerコンポーネントツリー内で共有する計測状態。 */
  protected readonly store = inject(TimerStore);
}
