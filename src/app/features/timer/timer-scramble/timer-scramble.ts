import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SolvePattern } from '../../../shared/solve-pattern/solve-pattern';
import { TimerStore } from '../timer.store';
import { TranslocoPipe } from '@jsverse/transloco';

/** 現在のスクランブルとキューブ状態を表示するコンポーネント。 */
@Component({
  selector: 'app-timer-scramble',
  imports: [MatButtonModule, MatIconModule, SolvePattern, TranslocoPipe],
  templateUrl: './timer-scramble.html',
  styleUrl: './timer-scramble.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerScramble {
  /** Timerコンポーネントツリー内で共有する計測状態。 */
  protected readonly store = inject(TimerStore);

  /** スクランブルを再作成し、次のSpace操作をタイマーで受け取れるようにする。 */
  protected newScramble(event: MouseEvent): void {
    (event.currentTarget as HTMLButtonElement).blur();
    this.store.newScramble();
  }
}
