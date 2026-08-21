import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CubeNetView } from '../../../shared/cube-net/cube-net';
import { TimerStore } from '../timer.store';
import { TranslocoPipe } from '@jsverse/transloco';

/** 現在のスクランブルとキューブ状態を表示するコンポーネント。 */
@Component({
  selector: 'app-timer-scramble',
  imports: [MatButtonModule, MatIconModule, CubeNetView, TranslocoPipe],
  templateUrl: './timer-scramble.html',
  styleUrl: './timer-scramble.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerScramble {
  /** Timerコンポーネントツリー内で共有する計測状態。 */
  protected readonly store = inject(TimerStore);
}
