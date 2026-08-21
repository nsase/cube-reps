import { ChangeDetectionStrategy, Component, HostListener, inject, output } from '@angular/core';
import { TimerClock } from './timer-clock/timer-clock';
import { TimerScramble } from './timer-scramble/timer-scramble';
import { TimerSettings } from './timer-settings/timer-settings';
import { TimerStats } from './timer-stats/timer-stats';
import { TimerStore } from './timer.store';

/** スペースキーまたはポインター操作で計測するタイマー画面。 */
@Component({
  selector: 'app-timer',
  imports: [TimerSettings, TimerScramble, TimerClock, TimerStats],
  providers: [TimerStore],
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timer {
  /** 履歴画面への遷移を親コンポーネントへ通知する。 */
  readonly showHistory = output<void>();
  /** Timerコンポーネントツリー内で共有する計測状態。 */
  private readonly store = inject(TimerStore);

  /** スペース押下で準備状態へ入り、計測中の場合は停止する。 */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.store.keyDown(event);
  }

  /** スペースを離したとき、準備状態であれば計測を開始する。 */
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    this.store.keyUp(event);
  }
}
